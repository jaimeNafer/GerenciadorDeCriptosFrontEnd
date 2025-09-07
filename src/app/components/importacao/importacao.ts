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
import { Subject, takeUntil, interval, switchMap, takeWhile } from 'rxjs';

@Component({
  selector: 'app-importacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CarteiraFormComponent,
    FileUploadComponent,
    ConfirmationModalComponent,
  ],
  providers: [CarteiraService, ArquivoService],
  templateUrl: './importacao.html',
  styleUrl: './importacao.scss',
  encapsulation: ViewEncapsulation.None,
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
  hasArquivosError = false;

  searchTerm = '';

  // Sistema de alertas
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showAlert = false;

  // Modal de confirmação para exclusão
  showDeleteModal = false;
  carteiraParaExcluir: Carteira | null = null;
  isDeleting = false;

  showDeleteArquivoModal = false;
  arquivoParaExcluir: Arquivo | null = null;
  isDeletingArquivo = false;

  private readonly carteiraService: CarteiraService;
  private readonly arquivoService: ArquivoService;

  constructor() {
    this.carteiraService = inject(CarteiraService);
    this.arquivoService = inject(ArquivoService);
  }

  ngOnInit(): void {
    console.log('OnInit chamado');
    this.loadCarteiras();
    this.loadCorretoras();
    console.log('OnInit finalizado');
  }

  loadCarteiras(): void {
    console.log('loadCarteiras chamado');
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
      },
    });
    console.log('loadCarteiras finalizado');
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

    // Usar o método do serviço que agora retorna Observable
    this.arquivoService
      .loadArquivosByCarteira(carteiraId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (arquivos) => {
          this.arquivos = arquivos.filter((a: Arquivo) => a.carteiraId === carteiraId);
          this.isLoadingArquivos = false;
          this.hasArquivosError = false;
        },
        error: (error) => {
          console.error('Erro ao carregar arquivos:', error);
          this.isLoadingArquivos = false;
          this.hasArquivosError = true;
          this.arquivos = [];
          this.showAlertMessage('Erro ao carregar arquivos. Tente novamente.', 'danger');
        },
      });

    // Também subscrever ao observable do serviço para receber atualizações em tempo real
    this.arquivoService.arquivos$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (arquivos) => {
        if (!this.hasArquivosError) {
          this.arquivos = arquivos.filter((a: Arquivo) => a.carteiraId === carteiraId);
        }
      },
    });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy chamado');
    this.destroy$.next();
    this.destroy$.complete();
    console.log('ngOnDestroy finalizado');
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
      const index = this.carteiras.findIndex((c) => c.idCarteira === carteira.idCarteira);
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
      },
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
    // Adicionar arquivo selecionado à lista local (sem upload ainda)
    this.arquivos = [arquivo, ...this.arquivos];
    this.showFileUpload = false;
    this.showAlertMessage(
      'Arquivo selecionado! Clique em "Processar" para fazer o upload.',
      'info'
    );
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

    if (!this.selectedCarteira) {
      console.error('Nenhuma carteira selecionada');
      return;
    }

    if (!arquivo.arquivoOriginal) {
      console.error('Arquivo original não encontrado');
      this.showAlertMessage('Erro: Arquivo original não encontrado', 'danger');
      return;
    }

    // Mostrar loading durante processamento
    this.isLoadingArquivos = true;

    // Enviar arquivo para o backend criar e processar
    const uploadRequest = {
      arquivo: arquivo.arquivoOriginal,
      carteiraId: this.selectedCarteira.idCarteira!,
      observacoes: arquivo.observacoes,
    };

    this.arquivoService.uploadArquivo(uploadRequest).subscribe({
      next: (arquivoUploadado) => {
        console.log('Arquivo enviado com sucesso:', arquivoUploadado);

        // Atualizar arquivo na lista com dados do backend
        const index = this.arquivos.findIndex((a) => a === arquivo);
        if (index !== -1) {
          this.arquivos[index] = {
            ...arquivoUploadado,
            status: StatusArquivo.PROCESSANDO,
          };
        }

        this.isLoadingArquivos = false;
        this.showAlertMessage('Arquivo enviado! Processando...', 'info');

        // Iniciar polling de status
        this.iniciarPollingStatus(arquivoUploadado.id!, this.selectedCarteira!.idCarteira!);
      },
      error: (error) => {
        console.error('Erro ao processar arquivo:', error);

        let errorMessage = 'Erro ao processar arquivo. Tente novamente.';

        // Tratar erro 422 especificamente (arquivo já importado)
        if (error.status === 422) {
          if (error.error && error.error.detail) {
            errorMessage = error.error.detail;
          } else {
            errorMessage = 'Este arquivo já foi importado.';
          }

          // Remover arquivo da lista já que não pode ser processado
          const index = this.arquivos.findIndex((a) => a === arquivo);
          if (index !== -1) {
            this.arquivos.splice(index, 1);
          }
        }

        this.showAlertMessage(errorMessage, 'danger');
        this.isLoadingArquivos = false;
      },
    });
  }

  private iniciarPollingStatus(arquivoId: number, carteiraId: number): void {
    // Polling a cada 2 segundos
    interval(2000)
      .pipe(
        switchMap(() => this.arquivoService.getStatusArquivo(carteiraId, arquivoId)),
        takeWhile((response) => response.status === 'PROCESSANDO', true), // Continua até não ser mais PROCESSANDO
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('Status do arquivo:', response.status);

          // Encontrar e atualizar o arquivo na lista
          const arquivo = this.arquivos.find((a) => a.id === arquivoId);
          if (arquivo) {
            arquivo.status = response.status as StatusArquivo;

            // Mostrar mensagem baseada no status final
            if (response.status === 'PROCESSADO') {
              this.showAlertMessage('Arquivo processado com sucesso!', 'success');
            } else if (response.status === 'ERRO') {
              this.showAlertMessage('Erro no processamento do arquivo.', 'danger');
            }
          }
        },
        error: (error) => {
          console.error('Erro no polling de status:', error);
          // Em caso de erro no polling, assumir que houve erro no processamento
          const arquivo = this.arquivos.find((a) => a.id === arquivoId);
          if (arquivo) {
            arquivo.status = StatusArquivo.ERRO;
            this.showAlertMessage('Erro ao verificar status do arquivo.', 'danger');
          }
        },
      });
  }

  deletarArquivo(arquivo: Arquivo): void {
    this.arquivoParaExcluir = arquivo;
    this.showDeleteArquivoModal = true;
  }

  confirmarExclusaoArquivo(): void {
    if (!this.arquivoParaExcluir || !this.selectedCarteira) {
      console.error('Arquivo ou carteira não selecionados');
      return;
    }

    this.isDeletingArquivo = true;

    // Usar API real para deletar arquivo
    this.arquivoService
      .deleteArquivo(this.arquivoParaExcluir.id!, this.selectedCarteira.idCarteira)
      .subscribe({
        next: () => {
          console.log('Arquivo excluído com sucesso');

          // Remover arquivo da lista local
          const index = this.arquivos.findIndex((a) => a.id === this.arquivoParaExcluir!.id);
          if (index !== -1) {
            this.arquivos.splice(index, 1);
          }

          this.showAlertMessage('Arquivo excluído com sucesso!', 'success');
          this.fecharModalExclusaoArquivo();
        },
        error: (error) => {
          console.error('Erro ao excluir arquivo:', error);
          this.showAlertMessage('Erro ao excluir arquivo. Tente novamente.', 'danger');
          this.isDeletingArquivo = false;
        },
      });
  }

  fecharModalExclusaoArquivo(): void {
    this.showDeleteArquivoModal = false;
    this.arquivoParaExcluir = null;
    this.isDeletingArquivo = false;
  }

  // Utilitários
  get carteirasFiltradas(): Carteira[] {
    if (!this.searchTerm.trim()) {
      return this.carteiras;
    }

    const term = this.searchTerm.toLowerCase();
    return this.carteiras.filter(
      (carteira) =>
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
    const corretora = this.corretoras.find(
      (c) => c.idCorretora === carteira.corretora?.idCorretora
    );
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

    // Menor que 1000 bytes - exibir em bytes
    if (bytes < 1000) {
      return bytes + ' Bytes';
    }

    // Entre 1000 bytes e 1MB - exibir em KB
    if (bytes < 1024 * 1024) {
      const kb = (bytes / 1024).toFixed(2);
      return parseFloat(kb) + ' KB';
    }

    // 1MB ou maior - exibir em MB
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return parseFloat(mb) + ' MB';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  // Métodos para gerenciar alertas
  showAlertMessage(
    message: string,
    type: 'success' | 'danger' | 'warning' | 'info' = 'info'
  ): void {
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
