export interface Operacao {
  id?: number;
  carteiraId: number;
  criptomoeda: string;
  simbolo: string;
  tipoOperacao: TipoOperacao;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  taxa?: number;
  dataOperacao: Date;
  observacoes?: string;
  status: StatusOperacao;
  corretoraId: number;
  hashTransacao?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export enum TipoOperacao {
  COMPRA = 'COMPRA',
  VENDA = 'VENDA',
  TRANSFERENCIA_ENTRADA = 'TRANSFERENCIA_ENTRADA',
  TRANSFERENCIA_SAIDA = 'TRANSFERENCIA_SAIDA',
  STAKING = 'STAKING',
  REWARD = 'REWARD',
  AIRDROP = 'AIRDROP'
}

export enum StatusOperacao {
  PENDENTE = 'PENDENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  ERRO = 'ERRO'
}

export interface CreateOperacaoRequest {
  carteiraId: number;
  criptomoeda: string;
  simbolo: string;
  tipoOperacao: TipoOperacao;
  quantidade: number;
  precoUnitario: number;
  taxa?: number;
  dataOperacao: Date;
  observacoes?: string;
  corretoraId: number;
  hashTransacao?: string;
}

export interface UpdateOperacaoRequest {
  criptomoeda?: string;
  simbolo?: string;
  tipoOperacao?: TipoOperacao;
  quantidade?: number;
  precoUnitario?: number;
  taxa?: number;
  dataOperacao?: Date;
  observacoes?: string;
  status?: StatusOperacao;
  hashTransacao?: string;
}

export interface OperacaoFilter {
  carteiraId?: number;
  criptomoeda?: string;
  tipoOperacao?: TipoOperacao;
  status?: StatusOperacao;
  dataInicio?: Date;
  dataFim?: Date;
  corretoraId?: number;
}

export interface OperacaoSummary {
  totalOperacoes: number;
  totalCompras: number;
  totalVendas: number;
  valorTotalInvestido: number;
  valorTotalVendido: number;
  lucroPreju: number;
  criptomoedasUnicas: number;
}

export interface Criptomoeda {
  id: number;
  nome: string;
  simbolo: string;
  precoAtual?: number;
  variacao24h?: number;
  ativa: boolean;
}

export interface PositionSummary {
  criptomoeda: string;
  simbolo: string;
  quantidadeTotal: number;
  precoMedio: number;
  valorInvestido: number;
  valorAtual?: number;
  lucroPreju?: number;
  percentualLucro?: number;
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