import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArquivoService } from '../../services/arquivo.service';
import { Arquivo, StatusArquivo, UploadArquivoRequest } from '../../models/arquivo.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() carteiraId: number | null = null;
  @Input() isVisible = false;
  @Output() uploadComplete = new EventEmitter<Arquivo>();
  @Output() cancelled = new EventEmitter<void>();

  selectedFile: File | null = null;
  observacoes = '';
  isUploading = false;
  uploadProgress = 0;
  dragOver = false;
  validationErrors: string[] = [];

  private readonly arquivoService = inject(ArquivoService);

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    if (!file) return;

    const validation = this.arquivoService.validarArquivoCSV(file);
    
    if (validation.valido) {
      this.selectedFile = file;
      this.validationErrors = [];
    } else {
      this.selectedFile = null;
      this.validationErrors = validation.erros;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.validationErrors = [];
    this.uploadProgress = 0;
  }

  selectFile(): void {
    if (!this.selectedFile || !this.carteiraId) {
      return;
    }

    // Criar objeto arquivo para retornar
    const arquivo: Arquivo = {
      nome: this.selectedFile.name,
      carteiraId: this.carteiraId!,
      dataCriacao: new Date(),
      tamanho: this.selectedFile.size,
      status: StatusArquivo.PENDENTE,
      observacoes: this.observacoes,
      arquivoOriginal: this.selectedFile
    };

    this.uploadComplete.emit(arquivo);
    this.resetForm();
  }


  onCancelClick(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.selectedFile = null;
    this.observacoes = '';
    this.validationErrors = [];
    this.dragOver = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get canSelect(): boolean {
    return !!(this.selectedFile && this.carteiraId && this.validationErrors.length === 0);
  }
}