export interface Corretora {
  id: number;
  nome: string;
  codigo?: string;
  ativa: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}