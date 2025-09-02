import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Operacao,
  TipoOperacao,
  StatusOperacao,
  CreateOperacaoRequest,
  UpdateOperacaoRequest,
  OperacaoFilter,
  OperacaoSummary,
  Criptomoeda,
  PositionSummary
} from '../models/operacao.model';

@Injectable({
  providedIn: 'root'
})
export class OperacaoService {
  private operacoesSubject = new BehaviorSubject<Operacao[]>(this.getMockOperacoes());
  public operacoes$ = this.operacoesSubject.asObservable();

  constructor() { }

  // Métodos CRUD
  getOperacoes(filter?: OperacaoFilter): Observable<Operacao[]> {
    let operacoes = this.operacoesSubject.value;
    
    if (filter) {
      operacoes = this.applyFilter(operacoes, filter);
    }
    
    return of(operacoes).pipe(delay(300));
  }

  getOperacaoById(id: number): Observable<Operacao | undefined> {
    const operacao = this.operacoesSubject.value.find(op => op.id === id);
    return of(operacao).pipe(delay(200));
  }

  createOperacao(request: CreateOperacaoRequest): Observable<Operacao> {
    const novaOperacao: Operacao = {
      ...request,
      id: this.generateId(),
      valorTotal: request.quantidade * request.precoUnitario + (request.taxa || 0),
      status: StatusOperacao.PENDENTE,
      dataCriacao: new Date(),
      dataAtualizacao: new Date()
    };

    const operacoes = [...this.operacoesSubject.value, novaOperacao];
    this.operacoesSubject.next(operacoes);
    
    return of(novaOperacao).pipe(delay(500));
  }

  updateOperacao(id: number, request: UpdateOperacaoRequest): Observable<Operacao> {
    const operacoes = this.operacoesSubject.value;
    const index = operacoes.findIndex(op => op.id === id);
    
    if (index === -1) {
      throw new Error('Operação não encontrada');
    }

    const operacaoAtualizada = {
      ...operacoes[index],
      ...request,
      dataAtualizacao: new Date()
    };

    if (request.quantidade && request.precoUnitario) {
      operacaoAtualizada.valorTotal = request.quantidade * request.precoUnitario + (request.taxa || 0);
    }

    operacoes[index] = operacaoAtualizada;
    this.operacoesSubject.next([...operacoes]);
    
    return of(operacaoAtualizada).pipe(delay(400));
  }

  deleteOperacao(id: number): Observable<boolean> {
    const operacoes = this.operacoesSubject.value.filter(op => op.id !== id);
    this.operacoesSubject.next(operacoes);
    return of(true).pipe(delay(300));
  }

  // Métodos de análise
  getOperacaoSummary(carteiraId?: number): Observable<OperacaoSummary> {
    let operacoes = this.operacoesSubject.value;
    
    if (carteiraId) {
      operacoes = operacoes.filter(op => op.carteiraId === carteiraId);
    }

    const summary: OperacaoSummary = {
      totalOperacoes: operacoes.length,
      totalCompras: operacoes.filter(op => op.tipoOperacao === TipoOperacao.COMPRA).length,
      totalVendas: operacoes.filter(op => op.tipoOperacao === TipoOperacao.VENDA).length,
      valorTotalInvestido: operacoes
        .filter(op => op.tipoOperacao === TipoOperacao.COMPRA)
        .reduce((sum, op) => sum + op.valorTotal, 0),
      valorTotalVendido: operacoes
        .filter(op => op.tipoOperacao === TipoOperacao.VENDA)
        .reduce((sum, op) => sum + op.valorTotal, 0),
      lucroPreju: 0,
      criptomoedasUnicas: new Set(operacoes.map(op => op.simbolo)).size
    };

    summary.lucroPreju = summary.valorTotalVendido - summary.valorTotalInvestido;
    
    return of(summary).pipe(delay(200));
  }

  getPositionSummary(carteiraId?: number): Observable<PositionSummary[]> {
    let operacoes = this.operacoesSubject.value;
    
    if (carteiraId) {
      operacoes = operacoes.filter(op => op.carteiraId === carteiraId);
    }

    const positionsMap = new Map<string, PositionSummary>();

    operacoes.forEach(op => {
      const key = op.simbolo;
      const existing = positionsMap.get(key) || {
        criptomoeda: op.criptomoeda,
        simbolo: op.simbolo,
        quantidadeTotal: 0,
        precoMedio: 0,
        valorInvestido: 0
      };

      if (op.tipoOperacao === TipoOperacao.COMPRA) {
        existing.quantidadeTotal += op.quantidade;
        existing.valorInvestido += op.valorTotal;
      } else if (op.tipoOperacao === TipoOperacao.VENDA) {
        existing.quantidadeTotal -= op.quantidade;
        existing.valorInvestido -= (op.valorTotal * existing.precoMedio / op.precoUnitario);
      }

      existing.precoMedio = existing.quantidadeTotal > 0 ? existing.valorInvestido / existing.quantidadeTotal : 0;
      positionsMap.set(key, existing);
    });

    const positions = Array.from(positionsMap.values()).filter(pos => pos.quantidadeTotal > 0);
    
    return of(positions).pipe(delay(300));
  }

  getCriptomoedas(): Observable<Criptomoeda[]> {
    return of(this.getMockCriptomoedas()).pipe(delay(200));
  }

  // Métodos auxiliares
  private applyFilter(operacoes: Operacao[], filter: OperacaoFilter): Operacao[] {
    return operacoes.filter(op => {
      if (filter.carteiraId && op.carteiraId !== filter.carteiraId) return false;
      if (filter.criptomoeda && !op.criptomoeda.toLowerCase().includes(filter.criptomoeda.toLowerCase())) return false;
      if (filter.tipoOperacao && op.tipoOperacao !== filter.tipoOperacao) return false;
      if (filter.status && op.status !== filter.status) return false;
      if (filter.corretoraId && op.corretoraId !== filter.corretoraId) return false;
      if (filter.dataInicio && new Date(op.dataOperacao) < filter.dataInicio) return false;
      if (filter.dataFim && new Date(op.dataOperacao) > filter.dataFim) return false;
      return true;
    });
  }

  private generateId(): number {
    const operacoes = this.operacoesSubject.value;
    return operacoes.length > 0 ? Math.max(...operacoes.map(op => op.id || 0)) + 1 : 1;
  }

  // Dados Mock
  private getMockOperacoes(): Operacao[] {
    return [
      // Janeiro 2024 - 12 operações
      {
        id: 1, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 0.5, precoUnitario: 45000, valorTotal: 22500, taxa: 50,
        dataOperacao: new Date('2024-01-02'), observacoes: 'Primeira compra do ano', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, hashTransacao: '0x1234567890abcdef', dataCriacao: new Date('2024-01-02'), dataAtualizacao: new Date('2024-01-02')
      },
      {
        id: 2, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 2.0, precoUnitario: 3000, valorTotal: 6000, taxa: 30,
        dataOperacao: new Date('2024-01-05'), observacoes: 'Diversificação ETH', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, hashTransacao: '0xabcdef1234567890', dataCriacao: new Date('2024-01-05'), dataAtualizacao: new Date('2024-01-05')
      },
      {
        id: 3, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 1000, precoUnitario: 0.5, valorTotal: 500, taxa: 5,
        dataOperacao: new Date('2024-01-08'), observacoes: 'Investimento ADA', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, dataCriacao: new Date('2024-01-08'), dataAtualizacao: new Date('2024-01-08')
      },
      {
        id: 4, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 10, precoUnitario: 98, valorTotal: 980, taxa: 10,
        dataOperacao: new Date('2024-01-12'), observacoes: 'Compra SOL', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, dataCriacao: new Date('2024-01-12'), dataAtualizacao: new Date('2024-01-12')
      },
      {
        id: 5, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 500, precoUnitario: 0.85, valorTotal: 425, taxa: 4,
        dataOperacao: new Date('2024-01-15'), observacoes: 'Compra MATIC', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, dataCriacao: new Date('2024-01-15'), dataAtualizacao: new Date('2024-01-15')
      },
      {
        id: 6, carteiraId: 1, criptomoeda: 'Chainlink', simbolo: 'LINK', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 50, precoUnitario: 15.2, valorTotal: 760, taxa: 8,
        dataOperacao: new Date('2024-01-18'), observacoes: 'Compra LINK', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, dataCriacao: new Date('2024-01-18'), dataAtualizacao: new Date('2024-01-18')
      },
      {
        id: 7, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 0.3, precoUnitario: 46000, valorTotal: 13800, taxa: 35,
        dataOperacao: new Date('2024-01-20'), observacoes: 'Acúmulo BTC', status: StatusOperacao.CONFIRMADA,
        corretoraId: 2, dataCriacao: new Date('2024-01-20'), dataAtualizacao: new Date('2024-01-20')
      },
      {
        id: 8, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 1.5, precoUnitario: 3100, valorTotal: 4650, taxa: 23,
        dataOperacao: new Date('2024-01-23'), observacoes: 'Mais ETH', status: StatusOperacao.CONFIRMADA,
        corretoraId: 2, dataCriacao: new Date('2024-01-23'), dataAtualizacao: new Date('2024-01-23')
      },
      {
        id: 9, carteiraId: 2, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.VENDA,
        quantidade: 0.1, precoUnitario: 47000, valorTotal: 4700, taxa: 12,
        dataOperacao: new Date('2024-01-25'), observacoes: 'Realização parcial', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, dataCriacao: new Date('2024-01-25'), dataAtualizacao: new Date('2024-01-25')
      },
      {
        id: 10, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 800, precoUnitario: 0.52, valorTotal: 416, taxa: 4,
        dataOperacao: new Date('2024-01-28'), observacoes: 'Mais ADA', status: StatusOperacao.CONFIRMADA,
        corretoraId: 1, dataCriacao: new Date('2024-01-28'), dataAtualizacao: new Date('2024-01-28')
      },
      {
        id: 11, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
        quantidade: 5, precoUnitario: 102, valorTotal: 510, taxa: 5,
        dataOperacao: new Date('2024-01-30'), observacoes: 'SOL adicional', status: StatusOperacao.CONFIRMADA,
        corretoraId: 2, dataCriacao: new Date('2024-01-30'), dataAtualizacao: new Date('2024-01-30')
      },
      {
         id: 12, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 300, precoUnitario: 0.88, valorTotal: 264, taxa: 3,
         dataOperacao: new Date('2024-01-31'), observacoes: 'Fechamento janeiro', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-01-31'), dataAtualizacao: new Date('2024-01-31')
       },

       // Fevereiro 2024 - 11 operações
       {
         id: 13, carteiraId: 2, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 0.2, precoUnitario: 48000, valorTotal: 9600, taxa: 25,
         dataOperacao: new Date('2024-02-01'), observacoes: 'Venda parcial BTC', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, hashTransacao: '0x9876543210fedcba', dataCriacao: new Date('2024-02-01'), dataAtualizacao: new Date('2024-02-01')
       },
       {
         id: 14, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 3.0, precoUnitario: 2950, valorTotal: 8850, taxa: 44,
         dataOperacao: new Date('2024-02-03'), observacoes: 'Aproveitando queda ETH', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-02-03'), dataAtualizacao: new Date('2024-02-03')
       },
       {
         id: 15, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1200, precoUnitario: 0.48, valorTotal: 576, taxa: 6,
         dataOperacao: new Date('2024-02-05'), observacoes: 'Acúmulo ADA', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-02-05'), dataAtualizacao: new Date('2024-02-05')
       },
       {
         id: 16, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 8, precoUnitario: 105, valorTotal: 840, taxa: 8,
         dataOperacao: new Date('2024-02-08'), observacoes: 'SOL em alta', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-02-08'), dataAtualizacao: new Date('2024-02-08')
       },
       {
         id: 17, carteiraId: 1, criptomoeda: 'Chainlink', simbolo: 'LINK', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 75, precoUnitario: 14.8, valorTotal: 1110, taxa: 11,
         dataOperacao: new Date('2024-02-10'), observacoes: 'Mais LINK', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-02-10'), dataAtualizacao: new Date('2024-02-10')
       },
       {
         id: 18, carteiraId: 2, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 1.0, precoUnitario: 3200, valorTotal: 3200, taxa: 16,
         dataOperacao: new Date('2024-02-12'), observacoes: 'Realização ETH', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-02-12'), dataAtualizacao: new Date('2024-02-12')
       },
       {
         id: 19, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 0.4, precoUnitario: 49000, valorTotal: 19600, taxa: 49,
         dataOperacao: new Date('2024-02-15'), observacoes: 'BTC subindo', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-02-15'), dataAtualizacao: new Date('2024-02-15')
       },
       {
         id: 20, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 600, precoUnitario: 0.92, valorTotal: 552, taxa: 6,
         dataOperacao: new Date('2024-02-18'), observacoes: 'MATIC recovery', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-02-18'), dataAtualizacao: new Date('2024-02-18')
       },
       {
         id: 21, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 900, precoUnitario: 0.55, valorTotal: 495, taxa: 5,
         dataOperacao: new Date('2024-02-22'), observacoes: 'ADA pump', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-02-22'), dataAtualizacao: new Date('2024-02-22')
       },
       {
         id: 22, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 6, precoUnitario: 110, valorTotal: 660, taxa: 7,
         dataOperacao: new Date('2024-02-25'), observacoes: 'SOL momentum', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-02-25'), dataAtualizacao: new Date('2024-02-25')
       },
       {
         id: 23, carteiraId: 1, criptomoeda: 'Chainlink', simbolo: 'LINK', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 40, precoUnitario: 16.5, valorTotal: 660, taxa: 7,
         dataOperacao: new Date('2024-02-28'), observacoes: 'Fechamento fevereiro', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-02-28'), dataAtualizacao: new Date('2024-02-28')
       },

       // Março 2024 - 13 operações
       {
         id: 24, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 0.6, precoUnitario: 51000, valorTotal: 30600, taxa: 76,
         dataOperacao: new Date('2024-03-02'), observacoes: 'BTC bull run', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-02'), dataAtualizacao: new Date('2024-03-02')
       },
       {
         id: 25, carteiraId: 2, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 0.15, precoUnitario: 52000, valorTotal: 7800, taxa: 20,
         dataOperacao: new Date('2024-03-05'), observacoes: 'Profit taking', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-05'), dataAtualizacao: new Date('2024-03-05')
       },
       {
         id: 26, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 2.5, precoUnitario: 3400, valorTotal: 8500, taxa: 42,
         dataOperacao: new Date('2024-03-08'), observacoes: 'ETH seguindo BTC', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-03-08'), dataAtualizacao: new Date('2024-03-08')
       },
       {
         id: 27, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 12, precoUnitario: 115, valorTotal: 1380, taxa: 14,
         dataOperacao: new Date('2024-03-10'), observacoes: 'SOL breakout', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-10'), dataAtualizacao: new Date('2024-03-10')
       },
       {
         id: 28, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1500, precoUnitario: 0.58, valorTotal: 870, taxa: 9,
         dataOperacao: new Date('2024-03-12'), observacoes: 'ADA altseason', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-12'), dataAtualizacao: new Date('2024-03-12')
       },
       {
         id: 29, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 800, precoUnitario: 0.95, valorTotal: 760, taxa: 8,
         dataOperacao: new Date('2024-03-15'), observacoes: 'MATIC rally', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-03-15'), dataAtualizacao: new Date('2024-03-15')
       },
       {
         id: 30, carteiraId: 2, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 4, precoUnitario: 120, valorTotal: 480, taxa: 5,
         dataOperacao: new Date('2024-03-18'), observacoes: 'SOL profit', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-18'), dataAtualizacao: new Date('2024-03-18')
       },
       {
         id: 31, carteiraId: 1, criptomoeda: 'Chainlink', simbolo: 'LINK', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 60, precoUnitario: 17.2, valorTotal: 1032, taxa: 10,
         dataOperacao: new Date('2024-03-20'), observacoes: 'LINK surge', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-20'), dataAtualizacao: new Date('2024-03-20')
       },
       {
         id: 32, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 0.25, precoUnitario: 53000, valorTotal: 13250, taxa: 33,
         dataOperacao: new Date('2024-03-22'), observacoes: 'BTC ATH approach', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-03-22'), dataAtualizacao: new Date('2024-03-22')
       },
       {
         id: 33, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1.8, precoUnitario: 3600, valorTotal: 6480, taxa: 32,
         dataOperacao: new Date('2024-03-25'), observacoes: 'ETH momentum', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-25'), dataAtualizacao: new Date('2024-03-25')
       },
       {
         id: 34, carteiraId: 2, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 500, precoUnitario: 0.62, valorTotal: 310, taxa: 3,
         dataOperacao: new Date('2024-03-28'), observacoes: 'ADA partial sell', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-03-28'), dataAtualizacao: new Date('2024-03-28')
       },
       {
         id: 35, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 400, precoUnitario: 1.02, valorTotal: 408, taxa: 4,
         dataOperacao: new Date('2024-03-30'), observacoes: 'MATIC $1 break', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-03-30'), dataAtualizacao: new Date('2024-03-30')
       },
       {
         id: 36, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 7, precoUnitario: 125, valorTotal: 875, taxa: 9,
         dataOperacao: new Date('2024-03-31'), observacoes: 'Março final', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-03-31'), dataAtualizacao: new Date('2024-03-31')
       },

       // Abril 2024 - 10 operações
       {
         id: 37, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 0.35, precoUnitario: 55000, valorTotal: 19250, taxa: 48,
         dataOperacao: new Date('2024-04-02'), observacoes: 'BTC novo ATH', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-04-02'), dataAtualizacao: new Date('2024-04-02')
       },
       {
         id: 38, carteiraId: 2, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 2.0, precoUnitario: 3800, valorTotal: 7600, taxa: 38,
         dataOperacao: new Date('2024-04-05'), observacoes: 'ETH profit taking', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-04-05'), dataAtualizacao: new Date('2024-04-05')
       },
       {
         id: 39, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 9, precoUnitario: 130, valorTotal: 1170, taxa: 12,
         dataOperacao: new Date('2024-04-08'), observacoes: 'SOL $130', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-04-08'), dataAtualizacao: new Date('2024-04-08')
       },
       {
         id: 40, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1100, precoUnitario: 0.65, valorTotal: 715, taxa: 7,
         dataOperacao: new Date('2024-04-10'), observacoes: 'ADA strong', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-04-10'), dataAtualizacao: new Date('2024-04-10')
       },
       {
         id: 41, carteiraId: 1, criptomoeda: 'Chainlink', simbolo: 'LINK', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 80, precoUnitario: 18.5, valorTotal: 1480, taxa: 15,
         dataOperacao: new Date('2024-04-12'), observacoes: 'LINK breakout', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-04-12'), dataAtualizacao: new Date('2024-04-12')
       },
       {
         id: 42, carteiraId: 2, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 0.1, precoUnitario: 56000, valorTotal: 5600, taxa: 14,
         dataOperacao: new Date('2024-04-15'), observacoes: 'BTC partial', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-04-15'), dataAtualizacao: new Date('2024-04-15')
       },
       {
         id: 43, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 700, precoUnitario: 1.08, valorTotal: 756, taxa: 8,
         dataOperacao: new Date('2024-04-18'), observacoes: 'MATIC above $1', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-04-18'), dataAtualizacao: new Date('2024-04-18')
       },
       {
         id: 44, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1.2, precoUnitario: 3900, valorTotal: 4680, taxa: 23,
         dataOperacao: new Date('2024-04-22'), observacoes: 'ETH dip buy', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-04-22'), dataAtualizacao: new Date('2024-04-22')
       },
       {
         id: 45, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 5, precoUnitario: 135, valorTotal: 675, taxa: 7,
         dataOperacao: new Date('2024-04-25'), observacoes: 'SOL strength', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-04-25'), dataAtualizacao: new Date('2024-04-25')
       },
       {
         id: 46, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 800, precoUnitario: 0.68, valorTotal: 544, taxa: 5,
         dataOperacao: new Date('2024-04-30'), observacoes: 'Abril final', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-04-30'), dataAtualizacao: new Date('2024-04-30')
       },

       // Maio 2024 - 12 operações
       {
         id: 47, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 0.45, precoUnitario: 58000, valorTotal: 26100, taxa: 65,
         dataOperacao: new Date('2024-05-01'), observacoes: 'Maio início', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-01'), dataAtualizacao: new Date('2024-05-01')
       },
       {
         id: 48, carteiraId: 2, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 6, precoUnitario: 140, valorTotal: 840, taxa: 8,
         dataOperacao: new Date('2024-05-03'), observacoes: 'SOL $140 sell', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-05-03'), dataAtualizacao: new Date('2024-05-03')
       },
       {
         id: 49, carteiraId: 1, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 2.8, precoUnitario: 4000, valorTotal: 11200, taxa: 56,
         dataOperacao: new Date('2024-05-05'), observacoes: 'ETH $4k', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-05'), dataAtualizacao: new Date('2024-05-05')
       },
       {
         id: 50, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1300, precoUnitario: 0.72, valorTotal: 936, taxa: 9,
         dataOperacao: new Date('2024-05-08'), observacoes: 'ADA momentum', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-05-08'), dataAtualizacao: new Date('2024-05-08')
       },
       {
         id: 51, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 900, precoUnitario: 1.15, valorTotal: 1035, taxa: 10,
         dataOperacao: new Date('2024-05-10'), observacoes: 'MATIC pump', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-10'), dataAtualizacao: new Date('2024-05-10')
       },
       {
         id: 52, carteiraId: 1, criptomoeda: 'Chainlink', simbolo: 'LINK', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 90, precoUnitario: 19.8, valorTotal: 1782, taxa: 18,
         dataOperacao: new Date('2024-05-12'), observacoes: 'LINK $20 approach', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-05-12'), dataAtualizacao: new Date('2024-05-12')
       },
       {
         id: 53, carteiraId: 2, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 0.2, precoUnitario: 59000, valorTotal: 11800, taxa: 30,
         dataOperacao: new Date('2024-05-15'), observacoes: 'BTC profit', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-15'), dataAtualizacao: new Date('2024-05-15')
       },
       {
         id: 54, carteiraId: 1, criptomoeda: 'Solana', simbolo: 'SOL', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 8, precoUnitario: 145, valorTotal: 1160, taxa: 12,
         dataOperacao: new Date('2024-05-18'), observacoes: 'SOL new high', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-18'), dataAtualizacao: new Date('2024-05-18')
       },
       {
         id: 55, carteiraId: 2, criptomoeda: 'Ethereum', simbolo: 'ETH', tipoOperacao: TipoOperacao.VENDA,
         quantidade: 1.5, precoUnitario: 4200, valorTotal: 6300, taxa: 32,
         dataOperacao: new Date('2024-05-20'), observacoes: 'ETH $4.2k sell', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-05-20'), dataAtualizacao: new Date('2024-05-20')
       },
       {
         id: 56, carteiraId: 1, criptomoeda: 'Cardano', simbolo: 'ADA', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 1000, precoUnitario: 0.75, valorTotal: 750, taxa: 8,
         dataOperacao: new Date('2024-05-22'), observacoes: 'ADA $0.75', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-22'), dataAtualizacao: new Date('2024-05-22')
       },
       {
         id: 57, carteiraId: 1, criptomoeda: 'Polygon', simbolo: 'MATIC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 600, precoUnitario: 1.22, valorTotal: 732, taxa: 7,
         dataOperacao: new Date('2024-05-25'), observacoes: 'MATIC rally', status: StatusOperacao.CONFIRMADA,
         corretoraId: 2, dataCriacao: new Date('2024-05-25'), dataAtualizacao: new Date('2024-05-25')
       },
       {
         id: 58, carteiraId: 1, criptomoeda: 'Bitcoin', simbolo: 'BTC', tipoOperacao: TipoOperacao.COMPRA,
         quantidade: 0.3, precoUnitario: 60000, valorTotal: 18000, taxa: 45,
         dataOperacao: new Date('2024-05-31'), observacoes: 'BTC $60k maio', status: StatusOperacao.CONFIRMADA,
         corretoraId: 1, dataCriacao: new Date('2024-05-31'), dataAtualizacao: new Date('2024-05-31')
       }
    ];
  }

  private getMockCriptomoedas(): Criptomoeda[] {
    return [
      { id: 1, nome: 'Bitcoin', simbolo: 'BTC', precoAtual: 47500, variacao24h: 2.5, ativa: true },
      { id: 2, nome: 'Ethereum', simbolo: 'ETH', precoAtual: 3200, variacao24h: -1.2, ativa: true },
      { id: 3, nome: 'Cardano', simbolo: 'ADA', precoAtual: 0.52, variacao24h: 5.8, ativa: true },
      { id: 4, nome: 'Solana', simbolo: 'SOL', precoAtual: 98, variacao24h: 3.1, ativa: true },
      { id: 5, nome: 'Polygon', simbolo: 'MATIC', precoAtual: 0.85, variacao24h: -2.3, ativa: true },
      { id: 6, nome: 'Chainlink', simbolo: 'LINK', precoAtual: 15.2, variacao24h: 1.8, ativa: true }
    ];
  }
}