import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ativo, PortfolioSummary, AtivoFilter, DistribuicaoPortfolio, EvolucaoPatrimonial, ConsolidacaoMensal, MetricasAvancadas } from '../models/ativo.model';

@Injectable({
  providedIn: 'root'
})
export class AtivoService {

  constructor() { }

  getAtivos(filter?: AtivoFilter): Observable<Ativo[]> {
    let ativos = this.getMockAtivos();

    if (filter) {
      if (filter.simbolo) {
        ativos = ativos.filter(a => a.simbolo.toLowerCase().includes(filter.simbolo!.toLowerCase()));
      }
      if (filter.criptomoeda) {
        ativos = ativos.filter(a => a.criptomoeda.toLowerCase().includes(filter.criptomoeda!.toLowerCase()));
      }
      if (filter.valorMinimoInvestido) {
        ativos = ativos.filter(a => a.valorInvestido >= filter.valorMinimoInvestido!);
      }
      if (filter.valorMaximoInvestido) {
        ativos = ativos.filter(a => a.valorInvestido <= filter.valorMaximoInvestido!);
      }
      if (filter.apenasComLucro) {
        ativos = ativos.filter(a => (a.percentualLucro || 0) > 0);
      }
      if (filter.apenasComPrejuizo) {
        ativos = ativos.filter(a => (a.percentualLucro || 0) < 0);
      }
      if (filter.ativo !== undefined) {
        ativos = ativos.filter(a => a.ativo === filter.ativo);
      }
    }

    return of(ativos);
  }

  getPortfolioSummary(): Observable<PortfolioSummary> {
    const ativos = this.getMockAtivos();
    const ativosAtivos = ativos.filter(a => a.ativo);
    
    const valorTotalInvestido = ativosAtivos.reduce((sum, a) => sum + a.valorInvestido, 0);
    const valorTotalAtual = ativosAtivos.reduce((sum, a) => sum + (a.valorAtual || 0), 0);
    const lucroTotalAbsoluto = valorTotalAtual - valorTotalInvestido;
    const lucroTotalPercentual = valorTotalInvestido > 0 ? (lucroTotalAbsoluto / valorTotalInvestido) * 100 : 0;
    
    const ativosOrdenados = ativosAtivos.sort((a, b) => (b.percentualLucro || 0) - (a.percentualLucro || 0));
    
    const summary: PortfolioSummary = {
      valorTotalInvestido,
      valorTotalAtual,
      lucroTotalAbsoluto,
      lucroTotalPercentual,
      quantidadeAtivos: ativosAtivos.length,
      melhorAtivo: ativosOrdenados.length > 0 ? {
        simbolo: ativosOrdenados[0].simbolo,
        percentualLucro: ativosOrdenados[0].percentualLucro || 0
      } : undefined,
      piorAtivo: ativosOrdenados.length > 0 ? {
        simbolo: ativosOrdenados[ativosOrdenados.length - 1].simbolo,
        percentualLucro: ativosOrdenados[ativosOrdenados.length - 1].percentualLucro || 0
      } : undefined
    };

    return of(summary);
  }

  getDistribuicaoPortfolio(): Observable<DistribuicaoPortfolio[]> {
    const ativos = this.getMockAtivos().filter(a => a.ativo);
    const valorTotalPortfolio = ativos.reduce((sum, a) => sum + (a.valorAtual || 0), 0);
    
    const distribuicao: DistribuicaoPortfolio[] = ativos.map(ativo => ({
      simbolo: ativo.simbolo,
      criptomoeda: ativo.criptomoeda,
      percentualPortfolio: valorTotalPortfolio > 0 ? ((ativo.valorAtual || 0) / valorTotalPortfolio) * 100 : 0,
      valorInvestido: ativo.valorInvestido,
      valorAtual: ativo.valorAtual || 0
    })).sort((a, b) => b.percentualPortfolio - a.percentualPortfolio);

    return of(distribuicao);
  }

  getEvolucaoPatrimonial(): Observable<EvolucaoPatrimonial[]> {
    const evolucao: EvolucaoPatrimonial[] = [];
    const dataInicial = new Date('2024-01-01');
    const dataAtual = new Date();
    let valorInvestidoAcumulado = 0;
    let valorTotalAcumulado = 0;

    // Gerar dados mensais de evolução
    for (let d = new Date(dataInicial); d <= dataAtual; d.setMonth(d.getMonth() + 1)) {
      const investimentoMensal = Math.random() * 5000 + 2000; // Entre R$ 2.000 e R$ 7.000
      valorInvestidoAcumulado += investimentoMensal;
      
      // Simular variação do mercado (-10% a +15%)
      const variacao = (Math.random() - 0.3) * 0.25;
      valorTotalAcumulado = valorInvestidoAcumulado * (1 + variacao);
      
      const lucroAcumulado = valorTotalAcumulado - valorInvestidoAcumulado;
      const percentualLucro = valorInvestidoAcumulado > 0 ? (lucroAcumulado / valorInvestidoAcumulado) * 100 : 0;

      evolucao.push({
        data: new Date(d),
        valorTotal: valorTotalAcumulado,
        valorInvestido: valorInvestidoAcumulado,
        lucroAcumulado,
        percentualLucro
      });
    }

    return of(evolucao);
  }

  getConsolidacaoMensal(): Observable<ConsolidacaoMensal[]> {
    const consolidacao: ConsolidacaoMensal[] = [];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let valorAnterior = 10000;
    
    for (let i = 0; i < 12; i++) {
      const investimentoMes = Math.random() * 4000 + 1000;
      const valorFinalMes = valorAnterior + investimentoMes + (Math.random() - 0.4) * 2000;
      const lucroMes = valorFinalMes - valorAnterior - investimentoMes;
      const percentualLucroMes = valorAnterior > 0 ? (lucroMes / valorAnterior) * 100 : 0;
      
      const ativos = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK', 'UNI', 'AVAX'];
      const melhorAtivo = ativos[Math.floor(Math.random() * ativos.length)];
      const piorAtivo = ativos[Math.floor(Math.random() * ativos.length)];

      consolidacao.push({
        mes: meses[i],
        ano: 2024,
        valorInicialMes: valorAnterior,
        valorFinalMes,
        investimentoMes,
        lucroMes,
        percentualLucroMes,
        melhorAtivo,
        piorAtivo
      });
      
      valorAnterior = valorFinalMes;
    }

    return of(consolidacao);
  }

  getMetricasAvancadas(): Observable<MetricasAvancadas> {
    const metricas: MetricasAvancadas = {
      volatilidade: 18.5, // Percentual
      drawdownMaximo: -12.3, // Percentual
      diasPositivos: 180,
      diasNegativos: 120,
      maiorGanhoMensal: 25.8, // Percentual
      maiorPerdaMensal: -8.2, // Percentual
      sharpeRatio: 1.45
    };

    return of(metricas);
  }

  private getMockAtivos(): Ativo[] {
    return [
      {
        id: 1,
        criptomoeda: 'Bitcoin',
        simbolo: 'BTC',
        quantidadeTotal: 0.15420000,
        precoMedio: 280000.00,
        valorInvestido: 43176.00,
        precoAtual: 320000.00,
        valorAtual: 49344.00,
        lucroPreju: 6168.00,
        percentualLucro: 14.29,
        variacao24h: 2.45,
        variacao7d: -1.23,
        variacao30d: 8.76,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 2,
        criptomoeda: 'Ethereum',
        simbolo: 'ETH',
        quantidadeTotal: 2.85000000,
        precoMedio: 12500.00,
        valorInvestido: 35625.00,
        precoAtual: 14200.00,
        valorAtual: 40470.00,
        lucroPreju: 4845.00,
        percentualLucro: 13.60,
        variacao24h: 1.87,
        variacao7d: 3.45,
        variacao30d: 12.34,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 3,
        criptomoeda: 'Cardano',
        simbolo: 'ADA',
        quantidadeTotal: 8500.00000000,
        precoMedio: 2.35,
        valorInvestido: 19975.00,
        precoAtual: 1.89,
        valorAtual: 16065.00,
        lucroPreju: -3910.00,
        percentualLucro: -19.57,
        variacao24h: -0.85,
        variacao7d: -2.14,
        variacao30d: -15.67,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 4,
        criptomoeda: 'Solana',
        simbolo: 'SOL',
        quantidadeTotal: 45.50000000,
        precoMedio: 420.00,
        valorInvestido: 19110.00,
        precoAtual: 580.00,
        valorAtual: 26390.00,
        lucroPreju: 7280.00,
        percentualLucro: 38.09,
        variacao24h: 4.23,
        variacao7d: 8.91,
        variacao30d: 25.67,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 5,
        criptomoeda: 'Polygon',
        simbolo: 'MATIC',
        quantidadeTotal: 2800.00000000,
        precoMedio: 4.20,
        valorInvestido: 11760.00,
        precoAtual: 3.85,
        valorAtual: 10780.00,
        lucroPreju: -980.00,
        percentualLucro: -8.33,
        variacao24h: -1.45,
        variacao7d: -0.67,
        variacao30d: -5.23,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 6,
        criptomoeda: 'Chainlink',
        simbolo: 'LINK',
        quantidadeTotal: 180.00000000,
        precoMedio: 65.00,
        valorInvestido: 11700.00,
        precoAtual: 78.50,
        valorAtual: 14130.00,
        lucroPreju: 2430.00,
        percentualLucro: 20.77,
        variacao24h: 3.12,
        variacao7d: 5.67,
        variacao30d: 18.45,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 7,
        criptomoeda: 'Polkadot',
        simbolo: 'DOT',
        quantidadeTotal: 320.00000000,
        precoMedio: 28.50,
        valorInvestido: 9120.00,
        precoAtual: 24.80,
        valorAtual: 7936.00,
        lucroPreju: -1184.00,
        percentualLucro: -12.98,
        variacao24h: -2.34,
        variacao7d: -1.89,
        variacao30d: -8.76,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 8,
        criptomoeda: 'Avalanche',
        simbolo: 'AVAX',
        quantidadeTotal: 125.00000000,
        precoMedio: 68.00,
        valorInvestido: 8500.00,
        precoAtual: 89.50,
        valorAtual: 11187.50,
        lucroPreju: 2687.50,
        percentualLucro: 31.62,
        variacao24h: 5.67,
        variacao7d: 12.34,
        variacao30d: 28.91,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 9,
        criptomoeda: 'Uniswap',
        simbolo: 'UNI',
        quantidadeTotal: 450.00000000,
        precoMedio: 18.50,
        valorInvestido: 8325.00,
        precoAtual: 16.20,
        valorAtual: 7290.00,
        lucroPreju: -1035.00,
        percentualLucro: -12.43,
        variacao24h: -1.78,
        variacao7d: -3.45,
        variacao30d: -9.87,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      },
      {
        id: 10,
        criptomoeda: 'Litecoin',
        simbolo: 'LTC',
        quantidadeTotal: 85.00000000,
        precoMedio: 95.00,
        valorInvestido: 8075.00,
        precoAtual: 102.50,
        valorAtual: 8712.50,
        lucroPreju: 637.50,
        percentualLucro: 7.89,
        variacao24h: 0.89,
        variacao7d: 2.34,
        variacao30d: 5.67,
        ultimaAtualizacao: new Date('2024-12-20T10:30:00'),
        ativo: true
      }
    ];
  }
}