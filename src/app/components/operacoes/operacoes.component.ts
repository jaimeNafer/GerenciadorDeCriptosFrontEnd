import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Carteira } from '../../models/carteira.model';
import { OperacaoService } from '../../services/operacao.service';
import { CarteiraService } from '../../services/carteira.service';
import { HistoricoOperacoesMensal, Operacao, OperacaoWrapper } from '../../models/operacao.model';

@Component({
  selector: 'app-operacoes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './operacoes.component.html',
  styleUrls: ['./operacoes.component.scss'],
})
export class OperacoesComponent implements OnInit {
  filterForm: FormGroup;
  carteiras: Carteira[] = [];
  wrapper: OperacaoWrapper[] = [];
  historicoMensal: HistoricoOperacoesMensal | null = null;

  loading = false;
  showForm = false;
  mensagemErro: string | null = null;

  constructor(
    private fb: FormBuilder,
    private operacaoService: OperacaoService,
    private carteiraService: CarteiraService
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      carteiraId: [''],
      criptomoeda: [''],
      tipoOperacao: [''],
      status: [''],
      dataInicio: [''],
      dataFim: [''],
      corretoraId: [''],
    });
  }
  loadInitialData(): void {
    this.loading = true;
    this.mensagemErro = null;
    this.carteiraService.getCarteiras().subscribe((carteiras) => {
      this.carteiras = carteiras;
      if (carteiras.length > 0) {
        this.loadOperacoesByCarteira(carteiras[0].idCarteira!);
      } else {
        this.loading = false;
      }
    });
  }

  private loadOperacoesByCarteira(carteiraId: number): void {
    this.operacaoService.getOperacoesByCarteira(carteiraId).subscribe({
      next: (operacoesWrapper) => {
        this.wrapper = operacoesWrapper;
        this.loading = false;
      },
      error: () => {
        this.mensagemErro = 'Erro ao carregar operações';
        this.loading = false;
      },
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number): string {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatNumber(value: number | null): string {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  }
  onCarteiraChange(): void {
    const carteiraId = this.filterForm.get('carteiraId')?.value;
    if (carteiraId) {
      this.loadOperacoesByCarteira(carteiraId);
    }
  }

  changePage(page: number): void {}

  clearFilters(): void {
    this.filterForm.reset();
  }

  applyFilters(filters: any): void {}

  public obterDataOperacao(operacao: Operacao): string {
    if (!operacao.dataOperacaoEntrada && !operacao.dataOperacaoSaida) {
      return '-';
    }
    return operacao.dataOperacaoEntrada
      ? this.formatDate(operacao.dataOperacaoEntrada)
      : this.formatDate(operacao.dataOperacaoSaida || '');
  }
}
