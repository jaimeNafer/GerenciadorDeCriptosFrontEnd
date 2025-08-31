export interface Carteira {
  id?: number;
  nome: string;
  usuarioId: number;
  corretoraId: number;
  dataCriacao?: Date;
  ativa?: boolean;
}

export interface CreateCarteiraRequest {
  nome: string;
  usuarioId: number;
  corretoraId: number;
}

export interface UpdateCarteiraRequest {
  nome?: string;
  ativa?: boolean;
}