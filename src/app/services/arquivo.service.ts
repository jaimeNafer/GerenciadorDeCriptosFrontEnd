import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Arquivo, UploadArquivoRequest, StatusArquivo } from '../models/arquivo.model';

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
  loadArquivosByCarteira(carteiraId: number): Observable<any> {
    return this.getArquivosByCarteira(carteiraId).pipe(
      map((arquivosAPI) => {
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
        return arquivosCombinados;
      }),
      catchError((error) => {
        console.error('Erro ao carregar arquivos:', error);
        // Manter apenas arquivos locais em caso de erro
        const arquivosAtuais = this.arquivosSubject.value;
        const arquivosLocais = arquivosAtuais.filter(a => 
          a.carteiraId === carteiraId && 
          (a.status === StatusArquivo.PENDENTE || a.status === StatusArquivo.PROCESSANDO)
        );
        this.arquivosSubject.next(arquivosLocais);
        // Propagar o erro para o componente
        return throwError(() => error);
      })
    );
  }

  // Obter arquivos por carteira via API
  getArquivosByCarteira(carteiraId: number): Observable<Arquivo[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${carteiraId}/arquivos`).pipe(
      map(response => response.map(arquivo => ({
        id: arquivo.idArquivo,
        nome: arquivo.nome,
        carteiraId: arquivo.carteira?.idCarteira || carteiraId,
        dataUpload: new Date(arquivo.dataCriacao || new Date()),
        tamanho: arquivo.tamanhoBytes || 0,
        status: arquivo.status as StatusArquivo, // Usar o status real do backend
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
  uploadArquivo(request: UploadArquivoRequest): Observable<Arquivo> {
    // Criar FormData para envio como MultipartFile
    const formData = new FormData();
    formData.append('file', request.arquivo);
    if (request.observacoes) {
      formData.append('observacoes', request.observacoes);
    }
    
    // Enviar para API
    return this.http.post<any>(`${this.apiUrl}/${request.carteiraId}/arquivos`, formData).pipe(
      map(response => {
        console.log('Resposta do backend:', response);
        
        // Mapear resposta do backend para modelo Arquivo
        const arquivoMapeado: Arquivo = {
          id: response.idArquivo,
          nome: response.nome,
          carteiraId: response.carteira?.idCarteira || request.carteiraId,
          status: response.status as StatusArquivo,
          tamanho: response.tamanhoBytes || 0,
          carteira: response.carteira
        };
        
        console.log('Arquivo mapeado:', arquivoMapeado);
        
        // Adicionar à lista local
        const arquivosAtuais = this.arquivosSubject.value;
        this.arquivosSubject.next([arquivoMapeado, ...arquivosAtuais]);
        
        return arquivoMapeado;
      }),
      catchError(error => {
        console.error('Erro ao enviar arquivo para API:', error);
        return throwError(() => error);
      })
    );
  }

  // Verificar status do arquivo via API
  getStatusArquivo(carteiraId: number, arquivoId: number): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/${carteiraId}/arquivos/${arquivoId}/status`).pipe(
      catchError(error => {
        console.error('Erro ao verificar status do arquivo:', error);
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