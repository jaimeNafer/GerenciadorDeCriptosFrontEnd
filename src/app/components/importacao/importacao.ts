import { Component, OnInit, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteiraFormComponent } from '../carteira-form/carteira-form.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { CarteiraService } from '../../services/carteira.service';
import { ArquivoService } from '../../services/arquivo.service';
import { Carteira } from '../../models/carteira.model';
import { Arquivo, StatusArquivo } from '../../models/arquivo.model';
import { Corretora } from '../../models/corretora.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-importacao',
  standalone: true,
  imports: [CommonModule, FormsModule, CarteiraFormComponent, FileUploadComponent, ConfirmationModalComponent],
  providers: [CarteiraService, ArquivoService],
  templateUrl: './importacao.html',
  styleUrl: './importacao.scss',
  encapsulation: ViewEncapsulation.None
})
export class ImportacaoComponent implements OnInit, OnDestroy {
  carteiras: Carteira[] = [];
  arquivos: Arquivo[] = [];
  corretoras: Corretora[] = [];
  
  // Expor enum para uso no template
  StatusArquivo = StatusArquivo;

  // Subject para gerenciar unsubscribe
  private destroy$ = new Subject<void>();
  
  selectedCarteira: Carteira | null = null;
  carteiraParaEdicao: Carteira | null = null;
  
  showCarteiraForm = false;
  showFileUpload = false;
  
  isLoadingCarteiras = false;
  isLoadingArquivos = false;
  
  searchTerm = '';
  
  // Sistema de alertas
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlert = false;
  
  // Modal de confirmação para exclusão
  showDeleteModal = false;
  carteiraParaExcluir: Carteira | null = null;
  isDeleting = false;
  
  private readonly carteiraService: CarteiraService;
  private readonly arquivoService: ArquivoService;
  
  constructor() {
    this.carteiraService = inject(CarteiraService);
    this.arquivoService = inject(ArquivoService);
  }
  
  ngOnInit(): void {
    this.loadCarteiras();
    this.loadCorretoras();

  }
  
  loadCarteiras(): void {
    this.isLoadingCarteiras = true;
    
    // Usando API real do backend
    this.carteiraService.getCarteiras().subscribe({
      next: (carteiras) => {
        this.carteiras = carteiras;
        this.isLoadingCarteiras = false;
        if (carteiras.length > 0 && !this.selectedCarteira) {
          this.selectCarteira(carteiras[0]);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar carteiras:', error);
        this.isLoadingCarteiras = false;
        
        // Fallback para dados mock em caso de erro
        console.log('Usando dados mock como fallback...');
        this.carteiras = this.carteiraService.getMockCarteiras();
        if (this.carteiras.length > 0 && !this.selectedCarteira) {
          this.selectCarteira(this.carteiras[0]);
        }
      }
    });
  }
  
  loadCorretoras(): void {
    this.corretoras = this.carteiraService.getMockCorretoras();
  }
  

  
  selectCarteira(carteira: Carteira): void {
    this.selectedCarteira = carteira;
    this.loadArquivosByCarteira(carteira.idCarteira);
  }
  
  loadArquivosByCarteira(carteiraId: number): void {
    this.isLoadingArquivos = true;
    
    // Usar o método do serviço que mantém arquivos locais
    this.arquivoService.loadArquivosByCarteira(carteiraId);
    
    // Subscrever ao observable do serviço para receber atualizações
    this.arquivoService.arquivos$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (arquivos) => {
        this.arquivos = arquivos.filter(a => a.carteiraId === carteiraId);
        this.isLoadingArquivos = false;
      },
      error: (error) => {
        console.error('Erro ao carregar arquivos:', error);
        this.isLoadingArquivos = false;
        this.arquivos = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      const index = this.carteiras.findIndex(c => c.idCarteira === carteira.idCarteira);
      if (index !== -1) {
        this.carteiras[index] = carteira;
        if (this.selectedCarteira?.idCarteira === carteira.idCarteira) {
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
    this.carteiraParaExcluir = carteira;
    this.showDeleteModal = true;
  }
  
  confirmarExclusaoCarteira(): void {
    if (!this.carteiraParaExcluir) return;
    
    this.isDeleting = true;
    
    this.carteiraService.deleteCarteira(this.carteiraParaExcluir.idCarteira).subscribe({
      next: () => {
        this.showAlert = true;
        this.alertType = 'success';
        this.alertMessage = `Carteira "${this.carteiraParaExcluir!.nome}" excluída com sucesso!`;
        
        // Atualizar lista de carteiras
        this.loadCarteiras();
        
        // Se a carteira excluída era a selecionada, limpar seleção
        if (this.selectedCarteira?.idCarteira === this.carteiraParaExcluir!.idCarteira) {
          this.selectedCarteira = null;
          this.arquivos = [];
        }
        
        this.fecharModalExclusao();
      },
      error: (error) => {
         console.error('Erro ao excluir carteira:', error);
         this.showAlert = true;
         this.alertType = 'danger';
         this.alertMessage = this.getErrorMessage(error);
         this.isDeleting = false;
       }
    });
  }
  
  fecharModalExclusao(): void {
     this.showDeleteModal = false;
     this.carteiraParaExcluir = null;
     this.isDeleting = false;
   }
   
   private getErrorMessage(error: any): string {
     if (error.status === 404) {
       return 'Carteira não encontrada. Ela pode já ter sido excluída.';
     } else if (error.status === 409) {
       return 'Não é possível excluir esta carteira pois ela possui operações associadas.';
     } else if (error.status === 403) {
       return 'Você não tem permissão para excluir esta carteira.';
     } else if (error.status === 500) {
       return 'Erro interno do servidor. Tente novamente mais tarde.';
     } else if (error.status === 0) {
       return 'Erro de conexão. Verifique sua internet e tente novamente.';
     } else {
       return 'Erro ao excluir carteira. Tente novamente.';
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
    // Adicionar arquivo através do serviço para manter sincronização
    this.arquivoService.addArquivo(arquivo);
    this.showFileUpload = false;
  }
  
  onUploadCanceled(): void {
    this.showFileUpload = false;
  }
  
  processarArquivo(arquivo: Arquivo): void {
    if (arquivo.status !== StatusArquivo.PENDENTE) {
      console.log('Arquivo não está pendente. Status atual:', arquivo.status);
      return;
    }
    
    console.log('Iniciando processamento do arquivo:', arquivo.nome);
    console.log('ID do arquivo:', arquivo.id);
    console.log('Tipo do ID:', typeof arquivo.id);
    
    if (!this.selectedCarteira) {
      console.error('Nenhuma carteira selecionada');
      return;
    }
    
    if (!arquivo.id) {
      console.error('ID do arquivo não definido');
      this.showAlertMessage('Erro: ID do arquivo não definido', 'danger');
      return;
    }
    
    // Mostrar loading durante processamento
    this.isLoadingArquivos = true;
    
    // Usar API real para processar arquivo
    this.arquivoService.processarArquivo(arquivo.id, this.selectedCarteira.idCarteira).subscribe({
      next: (response) => {
        console.log('Arquivo processado com sucesso:', response);
        this.showAlertMessage(`Arquivo processado com sucesso! ${response.totalOperacoes} operações criadas.`, 'success');
        // O status será atualizado automaticamente pelo serviço
        this.isLoadingArquivos = false;
      },
      error: (error) => {
        console.error('Erro ao processar arquivo:', error);
        this.showAlertMessage('Erro ao processar arquivo. Tente novamente.', 'danger');
        // O status de erro será atualizado automaticamente pelo serviço
        this.isLoadingArquivos = false;
      }
    });
  }
  
  deletarArquivo(arquivo: Arquivo): void {
    if (confirm(`Tem certeza que deseja excluir o arquivo "${arquivo.nome}"?`)) {
      if (!this.selectedCarteira) {
        console.error('Nenhuma carteira selecionada');
        return;
      }
      
      // Usar API real para deletar arquivo
      this.arquivoService.deleteArquivo(arquivo.id!, this.selectedCarteira.idCarteira).subscribe({
        next: () => {
          // A lista será recarregada automaticamente pelo serviço
          console.log('Arquivo excluído com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir arquivo:', error);
          // Manter arquivo na lista em caso de erro
        }
      });
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
      this.getCorretoraName(carteira).toLowerCase().includes(term)
    );
  }
  
  getCorretoraName(carteira: Carteira): string {
    if (carteira.corretora?.nome) {
      // Retorna apenas o primeiro nome da corretora
      return carteira.corretora.nome.split(' ')[0];
    }
    // Fallback para o método antigo se não houver dados aninhados
    const corretora = this.corretoras.find(c => c.idCorretora === carteira.corretoraId);
    return corretora ? corretora.nome.split(' ')[0] : 'N/A';
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
 
   // Métodos para gerenciar alertas
   showAlertMessage(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info'): void {
     this.alertMessage = message;
     this.alertType = type;
     this.showAlert = true;
 
     // Auto-hide após 5 segundos para alertas de sucesso e info
     if (type === 'success' || type === 'info') {
       setTimeout(() => {
         this.hideAlert();
       }, 5000);
     }
   }
 
   hideAlert(): void {
     this.showAlert = false;
     this.alertMessage = '';
   }
 }
