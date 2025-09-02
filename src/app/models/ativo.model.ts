export interface Ativo {
  id?: number;
  criptomoeda: string;
  simbolo: string;
  quantidadeTotal: number;
  precoMedio: number;
  valorInvestido: number;
  precoAtual?: number;
  valorAtual?: number;
  lucroPreju?: number;
  percentualLucro?: number;
  variacao24h?: number;
  variacao7d?: number;
  variacao30d?: number;
  ultimaAtualizacao?: Date;
  ativo: boolean;
}

export interface PortfolioSummary {
  valorTotalInvestido: number;
  valorTotalAtual: number;
  lucroTotalAbsoluto: number;
  lucroTotalPercentual: number;
  quantidadeAtivos: number;
  melhorAtivo?: {
    simbolo: string;
    percentualLucro: number;
  };
  piorAtivo?: {
    simbolo: string;
    percentualLucro: number;
  };
}

export interface AtivoFilter {
  simbolo?: string;
  criptomoeda?: string;
  valorMinimoInvestido?: number;
  valorMaximoInvestido?: number;
  apenasComLucro?: boolean;
  apenasComPrejuizo?: boolean;
  ativo?: boolean;
}

export interface DistribuicaoPortfolio {
  simbolo: string;
  criptomoeda: string;
  percentualPortfolio: number;
  valorInvestido: number;
  valorAtual: number;
}

export interface EvolucaoPatrimonial {
  data: Date;
  valorTotal: number;
  valorInvestido: number;
  lucroAcumulado: number;
  percentualLucro: number;
}

export interface ConsolidacaoMensal {
  mes: string;
  ano: number;
  valorInicialMes: number;
  valorFinalMes: number;
  investimentoMes: number;
  lucroMes: number;
  percentualLucroMes: number;
  melhorAtivo: string;
  piorAtivo: string;
}

export interface MetricasAvancadas {
  sharpeRatio?: number;
  volatilidade: number;
  drawdownMaximo: number;
  diasPositivos: number;
  diasNegativos: number;
  maiorGanhoMensal: number;
  maiorPerdaMensal: number;
}