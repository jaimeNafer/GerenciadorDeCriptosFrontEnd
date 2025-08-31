import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Arquivo, UploadArquivoRequest, ProcessarArquivoResponse, StatusArquivo } from '../models/arquivo.model';

@Injectable({
  providedIn: 'root'
})
export class ArquivoService {
  private arquivosSubject = new BehaviorSubject<Arquivo[]>([]);
  public arquivos$ = this.arquivosSubject.asObservable();

  constructor() {}

  // Carregar arquivos por carteira (mockado)
  loadArquivosByCarteira(carteiraId: number): void {
    this.getArquivosByCarteira(carteiraId).subscribe(arquivos => {
      this.arquivosSubject.next(arquivos);
    });
  }

  // Obter arquivos por carteira (mockado)
  getArquivosByCarteira(carteiraId: number): Observable<Arquivo[]> {
    const arquivos = this.getMockArquivos(carteiraId);
    return of(arquivos);
  }

  // Obter arquivo por ID (mockado)
  getArquivoById(id: number): Observable<Arquivo> {
    // Para buscar por ID, vamos buscar em todas as carteiras
    const todasCarteiras = [1, 2, 3]; // IDs das carteiras mockadas
    let arquivo: Arquivo | undefined;
    
    for (const carteiraId of todasCarteiras) {
      arquivo = this.getMockArquivos(carteiraId).find(a => a.id === id);
      if (arquivo) break;
    }
    
    return of(arquivo!);
  }

  // Upload de arquivo com progresso (mockado)
  uploadArquivo(request: UploadArquivoRequest): Observable<{ progress: number; arquivo?: Arquivo }> {
    // Simular progresso de upload
    return timer(0, 200).pipe(
      map(tick => {
        const progress = Math.min((tick + 1) * 20, 100);
        
        if (progress === 100) {
          // Criar arquivo mockado quando upload completa
          const novoArquivo: Arquivo = {
            id: Date.now(),
            nome: request.arquivo.name,
            carteiraId: request.carteiraId,
            dataUpload: new Date(),
            tamanho: request.arquivo.size,
            status: StatusArquivo.PENDENTE,
            totalOperacoes: 0,
            observacoes: request.observacoes
          };
          
          // Adicionar à lista de arquivos
          const arquivos = this.arquivosSubject.value;
          arquivos.push(novoArquivo);
          this.arquivosSubject.next(arquivos);
          
          return { progress: 100, arquivo: novoArquivo };
        }
        
        return { progress };
      }),
      switchMap(result => {
        if (result.progress === 100) {
          return of(result);
        }
        return of(result);
      })
    );
  }

  // Processar arquivo CSV (mockado)
  processarArquivo(id: number): Observable<ProcessarArquivoResponse> {
    // Simular processamento
    const arquivos = this.arquivosSubject.value;
    const index = arquivos.findIndex(a => a.id === id);
    
    if (index !== -1) {
      // Atualizar status para processando
      arquivos[index].status = StatusArquivo.PROCESSANDO;
      this.arquivosSubject.next(arquivos);
      
      // Simular processamento com delay
      return timer(2000).pipe(
        map(() => {
          // Atualizar para processado com operações mockadas
          arquivos[index].status = StatusArquivo.PROCESSADO;
          arquivos[index].totalOperacoes = Math.floor(Math.random() * 100) + 10;
          this.arquivosSubject.next(arquivos);
          
          return {
            sucesso: true,
            totalOperacoes: arquivos[index].totalOperacoes!,
            operacoesProcessadas: arquivos[index].totalOperacoes!,
            erros: []
          };
        })
      );
    }
    
    return of({
      sucesso: false,
      totalOperacoes: 0,
      operacoesProcessadas: 0,
      erros: ['Arquivo não encontrado']
    });
  }

  // Deletar arquivo (mockado)
  deleteArquivo(id: number): Observable<void> {
    const arquivos = this.arquivosSubject.value.filter(a => a.id !== id);
    this.arquivosSubject.next(arquivos);
    return of(void 0);
  }

  // Baixar arquivo original (mockado)
  downloadArquivo(id: number): Observable<Blob> {
    // Simular download criando um blob com conteúdo CSV mockado
    const csvContent = 'Data,Tipo,Ativo,Quantidade,Preco\n2024-01-15,Compra,BTC,0.1,50000\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return of(blob);
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

  // Dados mock para desenvolvimento
  getMockArquivos(carteiraId: number): Arquivo[] {
    return [
      {
        id: 1,
        nome: 'operacoes_janeiro_2024.csv',
        carteiraId: carteiraId,
        dataUpload: new Date('2024-01-15T10:30:00'),
        tamanho: 2048,
        status: StatusArquivo.PROCESSADO,
        totalOperacoes: 45,
        observacoes: 'Importação mensal'
      },
      {
        id: 2,
        nome: 'trades_fevereiro_2024.csv',
        carteiraId: carteiraId,
        dataUpload: new Date('2024-02-01T14:15:00'),
        tamanho: 1536,
        status: StatusArquivo.PROCESSANDO,
        totalOperacoes: 0
      },
      {
        id: 3,
        nome: 'operacoes_marco_2024.csv',
        carteiraId: carteiraId,
        dataUpload: new Date('2024-03-01T09:45:00'),
        tamanho: 3072,
        status: StatusArquivo.ERRO,
        totalOperacoes: 0,
        observacoes: 'Erro no formato da data'
      }
    ];
  }
}