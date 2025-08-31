import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteiraFormComponent } from '../carteira-form/carteira-form.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { CarteiraService } from '../../services/carteira.service';
import { ArquivoService } from '../../services/arquivo.service';
import { Carteira } from '../../models/carteira.model';
import { Arquivo, StatusArquivo } from '../../models/arquivo.model';
import { Corretora, Usuario } from '../../models/corretora.model';

@Component({
  selector: 'app-importacao',
  standalone: true,
  imports: [CommonModule, FormsModule, CarteiraFormComponent, FileUploadComponent],
  providers: [CarteiraService, ArquivoService],
  templateUrl: './importacao.html',
  styleUrl: './importacao.scss',
  encapsulation: ViewEncapsulation.None
})
export class ImportacaoComponent implements OnInit {
  carteiras: Carteira[] = [];
  arquivos: Arquivo[] = [];
  corretoras: Corretora[] = [];
  usuarios: Usuario[] = [];
  
  selectedCarteira: Carteira | null = null;
  carteiraParaEdicao: Carteira | null = null;
  
  showCarteiraForm = false;
  showFileUpload = false;
  
  isLoadingCarteiras = false;
  isLoadingArquivos = false;
  
  searchTerm = '';
  
  constructor(private readonly carteiraService: CarteiraService, private readonly arquivoService: ArquivoService) {}
  
  ngOnInit(): void {
    this.loadCarteiras();
    this.loadCorretoras();
    this.loadUsuarios();
  }
  
  loadCarteiras(): void {
    this.isLoadingCarteiras = true;
    
    // Usando dados mock por enquanto
    setTimeout(() => {
      this.carteiras = this.carteiraService.getMockCarteiras();
      this.isLoadingCarteiras = false;
      
      // Selecionar primeira carteira se existir
      if (this.carteiras.length > 0 && !this.selectedCarteira) {
        this.selectCarteira(this.carteiras[0]);
      }
    }, 500);
    
    // Para usar API real, descomente:
    // this.carteiraService.getCarteiras().subscribe({
    //   next: (carteiras) => {
    //     this.carteiras = carteiras;
    //     this.isLoadingCarteiras = false;
    //     if (carteiras.length > 0 && !this.selectedCarteira) {
    //       this.selectCarteira(carteiras[0]);
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Erro ao carregar carteiras:', error);
    //     this.isLoadingCarteiras = false;
    //   }
    // });
  }
  
  loadCorretoras(): void {
    this.corretoras = this.carteiraService.getMockCorretoras();
  }
  
  loadUsuarios(): void {
    this.usuarios = this.carteiraService.getMockUsuarios();
  }
  
  selectCarteira(carteira: Carteira): void {
    this.selectedCarteira = carteira;
    this.loadArquivosByCarteira(carteira.id!);
  }
  
  loadArquivosByCarteira(carteiraId: number): void {
    this.isLoadingArquivos = true;
    
    // Usando dados mock por enquanto
    setTimeout(() => {
      this.arquivos = this.arquivoService.getMockArquivos(carteiraId);
      this.isLoadingArquivos = false;
    }, 300);
    
    // Para usar API real, descomente:
    // this.arquivoService.getArquivosByCarteira(carteiraId).subscribe({
    //   next: (arquivos) => {
    //     this.arquivos = arquivos;
    //     this.isLoadingArquivos = false;
    //   },
    //   error: (error) => {
    //     console.error('Erro ao carregar arquivos:', error);
    //     this.isLoadingArquivos = false;
    //   }
    // });
  }
  
  // Ações de Carteira
  openNovaCarteira(): void {
    this.carteiraParaEdicao = null;
    this.showCarteiraForm = true;
  }
  
  openEditarCarteira(carteira: Carteira): void {
    this.carteiraParaEdicao = carteira;
    this.showCarteiraForm = true;
  }
  
  onCarteiraSaved(carteira: Carteira): void {
    if (this.carteiraParaEdicao) {
      // Atualizar carteira existente
      const index = this.carteiras.findIndex(c => c.id === carteira.id);
      if (index !== -1) {
        this.carteiras[index] = carteira;
        if (this.selectedCarteira?.id === carteira.id) {
          this.selectedCarteira = carteira;
        }
      }
    } else {
      // Adicionar nova carteira
      this.carteiras.push(carteira);
      this.selectCarteira(carteira);
    }
    
    this.showCarteiraForm = false;
    this.carteiraParaEdicao = null;
  }
  
  onCarteiraFormCanceled(): void {
    this.showCarteiraForm = false;
    this.carteiraParaEdicao = null;
  }
  
  deletarCarteira(carteira: Carteira): void {
    if (confirm(`Tem certeza que deseja excluir a carteira "${carteira.nome}"?`)) {
      // Simular exclusão
      this.carteiras = this.carteiras.filter(c => c.id !== carteira.id);
      
      if (this.selectedCarteira?.id === carteira.id) {
        this.selectedCarteira = this.carteiras.length > 0 ? this.carteiras[0] : null;
        if (this.selectedCarteira) {
          this.loadArquivosByCarteira(this.selectedCarteira.id!);
        } else {
          this.arquivos = [];
        }
      }
      
      // Para usar API real, descomente:
      // this.carteiraService.deleteCarteira(carteira.id!).subscribe({
      //   next: () => {
      //     this.loadCarteiras();
      //   },
      //   error: (error) => {
      //     console.error('Erro ao excluir carteira:', error);
      //   }
      // });
    }
  }
  
  // Ações de Arquivo
  openUploadArquivo(): void {
    if (!this.selectedCarteira) {
      alert('Selecione uma carteira primeiro');
      return;
    }
    this.showFileUpload = true;
  }
  
  onUploadComplete(arquivo: Arquivo): void {
    this.arquivos.unshift(arquivo); // Adicionar no início da lista
    this.showFileUpload = false;
  }
  
  onUploadCanceled(): void {
    this.showFileUpload = false;
  }
  
  processarArquivo(arquivo: Arquivo): void {
    if (arquivo.status !== StatusArquivo.PENDENTE) {
      return;
    }
    
    // Simular processamento
    arquivo.status = StatusArquivo.PROCESSANDO;
    
    setTimeout(() => {
      arquivo.status = StatusArquivo.PROCESSADO;
      arquivo.totalOperacoes = Math.floor(Math.random() * 50) + 10;
    }, 2000);
    
    // Para usar API real, descomente:
    // this.arquivoService.processarArquivo(arquivo.id!).subscribe({
    //   next: (response) => {
    //     arquivo.status = StatusArquivo.PROCESSADO;
    //     arquivo.totalOperacoes = response.totalOperacoes;
    //   },
    //   error: (error) => {
    //     console.error('Erro ao processar arquivo:', error);
    //     arquivo.status = StatusArquivo.ERRO;
    //   }
    // });
  }
  
  deletarArquivo(arquivo: Arquivo): void {
    if (confirm(`Tem certeza que deseja excluir o arquivo "${arquivo.nome}"?`)) {
      this.arquivos = this.arquivos.filter(a => a.id !== arquivo.id);
      
      // Para usar API real, descomente:
      // this.arquivoService.deleteArquivo(arquivo.id!).subscribe({
      //   next: () => {
      //     this.loadArquivosByCarteira(this.selectedCarteira!.id!);
      //   },
      //   error: (error) => {
      //     console.error('Erro ao excluir arquivo:', error);
      //   }
      // });
    }
  }
  
  // Utilitários
  get carteirasFiltradas(): Carteira[] {
    if (!this.searchTerm.trim()) {
      return this.carteiras;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.carteiras.filter(carteira => 
      carteira.nome.toLowerCase().includes(term) ||
      this.getCorretoraName(carteira.corretoraId).toLowerCase().includes(term) ||
      this.getUsuarioName(carteira.usuarioId).toLowerCase().includes(term)
    );
  }
  
  getCorretoraName(corretoraId: number): string {
    const corretora = this.corretoras.find(c => c.id === corretoraId);
    return corretora ? corretora.nome : 'N/A';
  }
  
  getUsuarioName(usuarioId: number): string {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nome : 'N/A';
  }
  
  getStatusClass(status: StatusArquivo): string {
    switch (status) {
      case StatusArquivo.PENDENTE:
        return 'status-pendente';
      case StatusArquivo.PROCESSANDO:
        return 'status-processando';
      case StatusArquivo.PROCESSADO:
        return 'status-processado';
      case StatusArquivo.ERRO:
        return 'status-erro';
      default:
        return '';
    }
  }
  
  getStatusText(status: StatusArquivo): string {
    switch (status) {
      case StatusArquivo.PENDENTE:
        return 'Pendente';
      case StatusArquivo.PROCESSANDO:
        return 'Processando';
      case StatusArquivo.PROCESSADO:
        return 'Processado';
      case StatusArquivo.ERRO:
        return 'Erro';
      default:
        return status;
    }
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}
