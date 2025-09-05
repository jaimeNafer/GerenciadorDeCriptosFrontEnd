export interface Corretora {
  idCorretora: number;
  nome: string;
}

export interface Carteira {
  idCarteira: number;
  nome: string;
  corretora?: Corretora;
  corretoraId?: number; // Mantido para compatibilidade
  dataCriacao?: Date;
  excluido?: boolean;
}

// Interface para compatibilidade com código existente
export interface CarteiraLegacy {
  id?: number;
  nome: string;
  corretoraId: number;
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