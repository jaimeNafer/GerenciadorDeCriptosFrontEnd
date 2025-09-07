import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Arquivo, UploadArquivoRequest, ProcessarArquivoResponse, StatusArquivo } from '../models/arquivo.model';

@Injectable({
  providedIn: 'root'
})
export class ArquivoService {
  private readonly apiUrl = 'http://localhost:8080/v1/carteiras';
  private arquivosSubject = new BehaviorSubject<Arquivo[]>([]);
  public arquivos$ = this.arquivosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Adicionar arquivo ao estado local
  addArquivo(arquivo: Arquivo): void {
    const arquivosAtuais = this.arquivosSubject.value;
    const novosArquivos = [arquivo, ...arquivosAtuais];
    console.log('Adicionando arquivo ao serviço:', arquivo);
    console.log('Lista atualizada:', novosArquivos);
    this.arquivosSubject.next(novosArquivos);
  }

  // Carregar arquivos por carteira
  loadArquivosByCarteira(carteiraId: number): void {
    this.getArquivosByCarteira(carteiraId).subscribe({
      next: (arquivosAPI) => {
        // Manter arquivos locais (PENDENTE/PROCESSANDO) e adicionar os da API
        const arquivosAtuais = this.arquivosSubject.value;
        const arquivosLocais = arquivosAtuais.filter(a => 
          a.carteiraId === carteiraId && 
          (a.status === StatusArquivo.PENDENTE || a.status === StatusArquivo.PROCESSANDO)
        );
        
        // Combinar arquivos locais com os da API
        const arquivosCombinados = [...arquivosLocais, ...arquivosAPI];
        console.log('Carregando arquivos da carteira:', carteiraId);
        console.log('Arquivos da API:', arquivosAPI);
        console.log('Arquivos locais mantidos:', arquivosLocais);
        console.log('Arquivos combinados:', arquivosCombinados);
        
        this.arquivosSubject.next(arquivosCombinados);
      },
      error: (error) => {
        console.error('Erro ao carregar arquivos:', error);
        // Manter apenas arquivos locais em caso de erro
        const arquivosAtuais = this.arquivosSubject.value;
        const arquivosLocais = arquivosAtuais.filter(a => 
          a.carteiraId === carteiraId && 
          (a.status === StatusArquivo.PENDENTE || a.status === StatusArquivo.PROCESSANDO)
        );
        this.arquivosSubject.next(arquivosLocais);
      }
    });
  }

  // Obter arquivos por carteira via API
  getArquivosByCarteira(carteiraId: number): Observable<Arquivo[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${carteiraId}/arquivos`).pipe(
      map(response => response.map(arquivo => ({
        id: arquivo.idArquivo,
        nome: arquivo.nome,
        carteiraId: arquivo.carteira?.idCarteira || carteiraId,
        dataUpload: new Date(arquivo.dataCriacao || new Date()),
        tamanho: arquivo.tamanho || 0,
        status: StatusArquivo.PROCESSADO, // Assumindo que arquivos retornados já foram processados
        totalOperacoes: arquivo.totalOperacoes || 0,
        observacoes: arquivo.observacoes
      }))),
      catchError(this.handleError)
    );
  }

  // Obter arquivo por ID
  getArquivoById(id: number): Observable<Arquivo> {
    // Buscar no estado atual dos arquivos carregados
    const arquivos = this.arquivosSubject.value;
    const arquivo = arquivos.find(a => a.id === id);
    
    if (arquivo) {
      return of(arquivo);
    }
    
    // Se não encontrou, retornar erro
    return throwError(() => new Error(`Arquivo com ID ${id} não encontrado`));
  }

  // Upload de arquivo - envia para API como MultipartFile
  uploadArquivo(request: UploadArquivoRequest): Observable<{ progress: number; arquivo?: Arquivo }> {
    // Criar FormData para envio como MultipartFile
    const formData = new FormData();
    formData.append('arquivo', request.arquivo);
    if (request.observacoes) {
      formData.append('observacoes', request.observacoes);
    }
    
    // Enviar para API
    return this.http.post<Arquivo>(`${this.apiUrl}/${request.carteiraId}/arquivos`, formData).pipe(
      map(arquivoResponse => {
        console.log('Arquivo enviado com sucesso para API:', arquivoResponse);
        
        // Adicionar à lista local
        const arquivosAtuais = this.arquivosSubject.value;
        this.arquivosSubject.next([arquivoResponse, ...arquivosAtuais]);
        
        return { progress: 100, arquivo: arquivoResponse };
      }),
      catchError(error => {
        console.error('Erro ao enviar arquivo para API:', error);
        return throwError(() => error);
      })
    );
  }

  // Processar arquivo CSV - chama API de processamento
  processarArquivo(id: number, carteiraId: number): Observable<ProcessarArquivoResponse> {
    // Buscar arquivo na lista local
    const arquivos = this.arquivosSubject.value;
    console.log('Arquivos disponíveis:', arquivos);
    console.log('Procurando arquivo com ID:', id);
    const arquivo = arquivos.find(a => a.id === id);
    console.log('Arquivo encontrado:', arquivo);
    
    if (!arquivo) {
      console.error('Arquivo não encontrado na lista local');
      return throwError(() => new Error('Arquivo não encontrado'));
    }
    
    // Atualizar status para PROCESSANDO
    const arquivosAtualizados = arquivos.map(a => 
      a.id === id ? { ...a, status: StatusArquivo.PROCESSANDO } : a
    );
    this.arquivosSubject.next(arquivosAtualizados);
    
    // Chamar API de processamento (POST para processar arquivo já enviado)
    return this.http.post<ProcessarArquivoResponse>(`${this.apiUrl}/${carteiraId}/arquivos/${id}/processar`, {}).pipe(
      map(response => {
        console.log('Resposta da API de processamento:', response);
        
        // Atualizar arquivo com dados da API
        const arquivosFinais = this.arquivosSubject.value.map(a => {
          if (a.id === id) {
            return {
              ...a,
              id: response.idArquivo, // Usar ID real da API
              nome: response.nome || a.nome,
              dataUpload: new Date(response.dataCriacao || a.dataUpload),
              status: StatusArquivo.PROCESSADO,
              totalOperacoes: response.totalOperacoes || 0,
              arquivoOriginal: undefined // Remover arquivo original após processamento
            };
          }
          return a;
        });
        this.arquivosSubject.next(arquivosFinais);
        
        return {
          sucesso: true,
          totalOperacoes: response.totalOperacoes || 0
        };
      }),
      catchError(error => {
        // Atualizar status para ERRO em caso de falha
        const arquivosComErro = this.arquivosSubject.value.map(a => 
          a.id === id ? { ...a, status: StatusArquivo.ERRO } : a
        );
        this.arquivosSubject.next(arquivosComErro);
        
        console.error('Erro ao processar arquivo:', error);
        return throwError(() => error);
      })
    );
  }

  // Deletar arquivo via API
  deleteArquivo(id: number, carteiraId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${carteiraId}/arquivos/${id}`).pipe(
      map(() => {
        // Recarregar lista de arquivos após exclusão
        this.loadArquivosByCarteira(carteiraId);
      }),
      catchError(this.handleError)
    );
  }

  // Baixar arquivo original via API
  downloadArquivo(id: number, carteiraId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${carteiraId}/arquivos/${id}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Validar formato do arquivo CSV
  validarArquivoCSV(arquivo: File): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    
    // Verificar extensão
    if (!arquivo.name.toLowerCase().endsWith('.csv')) {
      erros.push('Arquivo deve ter extensão .csv');
    }
    
    // Verificar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > maxSize) {
      erros.push('Arquivo muito grande. Tamanho máximo: 10MB');
    }
    
    // Verificar se não está vazio
    if (arquivo.size === 0) {
      erros.push('Arquivo está vazio');
    }
    
    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Tratamento de erros
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Erro na requisição de arquivos:', error);
    return throwError(() => error);
  }
}