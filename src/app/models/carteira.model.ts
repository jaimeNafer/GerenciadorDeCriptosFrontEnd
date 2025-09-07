export interface Corretora {
  idCorretora: number;
  nome: string;
}

export interface Carteira {
  idCarteira: number;
  nome: string;
  corretora?: Corretora;
  dataCriacao?: Date;
  excluido?: boolean;
}

export interface CreateCarteiraRequest {
  nome: string;
  corretora: {
    idCorretora: number;
  };
}

export interface UpdateCarteiraRequest {
  nome?: string;
  excluido?: boolean;
}