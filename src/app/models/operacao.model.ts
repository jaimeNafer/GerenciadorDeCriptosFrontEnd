export interface OperacaoWrapper {
  mesAnoReferencia: string;
  consolidado: ConsolidadoMensal;
  operacoes: Operacao[];
}

export interface ConsolidadoMensal {
  numeroTotalMovimentacoes: number;
  valorTotalMovimentacoes: number;
  valorTotalCompras: number;
  valorTotalVendas: number;
  valorTotalPermutas: number;
  valorTotalLucroPrejuizo: number;
  deveDeclararIN1888: boolean;
}

export interface Operacao {
  criptomoeda: any;
  simbolo: any;
  valorTotal: number;
  quantidade: number;
  idOperacao: number;
  finalidade: {
    nome: string;
    descricao: string;
  };
  dataOperacaoEntrada: string;
  quantidadeEntrada: number;
  moedaEntrada: {
    ticker: string;
    nome: string;
    descricao: string;
    icone: string;
  };
  dataOperacaoSaida: string | null;
  quantidadeSaida: number | null;
  moedaSaida: {
    ticker: string;
    nome: string;
    descricao: string;
    icone: string;
  } | null;
  valorBrl: number;
  lucroPrejuizo: number;
  destino: string | null;
  taxaValorBrl: number | null;
  origemRegistro: string;
  observacao: string | null;
  tipoOperacao: string;
  statusOperacao: string;
}

export enum TipoOperacao {
  COMPRA = 'COMPRA',
  VENDA = 'VENDA',
  PERMUTA = 'PERMUTA',
  STAKING = 'STAKING',
  REWARD = 'REWARD',
  AIRDROP = 'AIRDROP',
}

export enum StatusOperacao {
  PENDENTE = 'PENDENTE',
  PROCESSADA = 'PROCESSADA',
  ERRO = 'ERRO',
}

// Interfaces para agrupamento mensal
export interface ConsolidadoMensal {
  mes: string; // formato: "2024-01" ou "Janeiro 2024"
  ano: number;
  mesNumero: number;
  totalOperacoes: number;
  totalCompras: number;
  totalVendas: number;
  valorTotalCompras: number;
  valorTotalVendas: number;
  saldoMensal: number;
  criptomoedasOperadas: string[];
}

export interface OperacoesPorMes {
  consolidado: ConsolidadoMensal;
  operacoes: Operacao[];
}

export interface HistoricoOperacoesMensal {
  periodoTotal: {
    dataInicio: Date;
    dataFim: Date;
    totalGeral: number;
    saldoGeral: number;
  };
  meses: OperacoesPorMes[];
}
