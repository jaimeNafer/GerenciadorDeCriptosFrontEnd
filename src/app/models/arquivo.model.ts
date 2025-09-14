import { Carteira } from "./carteira.model";

export interface Arquivo {
  id?: number;
  nome: string;
  carteiraId: number;
  dataCriacao?: Date;
  tamanho?: number;
  tamanhoBytes?: number;
  status: StatusArquivo;
  carteira?: {
    idCarteira: number;
    nome: string;
  };
  arquivoOriginal?: File; // Para arquivos locais antes do upload
  observacoes?: string;
  totalOperacoes?: number;
}

export enum StatusArquivo {
  PENDENTE = 'PENDENTE',
  PROCESSANDO = 'PROCESSANDO',
  PROCESSADO = 'PROCESSADO',
  ERRO = 'ERRO'
}

export interface UploadArquivoRequest {
  arquivo: File;
  carteiraId: number;
  observacoes?: string;
}

export interface ProcessarArquivoResponse {
  sucesso: boolean;
  totalOperacoes: number;
  erros?: string[];
  avisos?: string[];
}