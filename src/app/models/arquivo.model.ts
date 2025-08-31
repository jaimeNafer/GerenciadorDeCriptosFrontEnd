export interface Arquivo {
  id?: number;
  nome: string;
  carteiraId: number;
  dataUpload: Date;
  tamanho?: number;
  status: StatusArquivo;
  totalOperacoes?: number;
  observacoes?: string;
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