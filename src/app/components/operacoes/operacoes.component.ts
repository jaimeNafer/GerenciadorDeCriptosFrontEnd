import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { OperacaoService } from '../../services/operacao.service';
import { CarteiraService } from '../../services/carteira.service';
import {
  Operacao,
  TipoOperacao,
  StatusOperacao,
  CreateOperacaoRequest,
  OperacaoFilter,
  OperacaoSummary,
  Criptomoeda,
  PositionSummary,
  ConsolidadoMensal,
  OperacoesPorMes,
  HistoricoOperacoesMensal
} from '../../models/operacao.model';
import { Carteira } from '../../models/carteira.model';

@Component({
  selector: 'app-operacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './operacoes.component.html',
  styleUrls: ['./operacoes.component.scss']
})
export class OperacoesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Dados
  operacoes: Operacao[] = [];
  carteiras: Carteira[] = [];
  criptomoedas: Criptomoeda[] = [];
  summary: OperacaoSummary | null = null;
  positions: PositionSummary[] = [];
  
  // Dados agrupados por mês
  historicoMensal: HistoricoOperacoesMensal | null = null;
  operacoesPorMes: OperacoesPorMes[] = [];
  
  // Estados
  loading = false;
  showForm = false;
  editingOperacao: Operacao | null = null;
  
  // Formulários
  operacaoForm: FormGroup;
  filterForm: FormGroup;
  
  // Enums para template
  TipoOperacao = TipoOperacao;
  StatusOperacao = StatusOperacao;
  
  // Paginação
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Filtros
  activeFilters: OperacaoFilter = {};
  
  constructor(
    private operacaoService: OperacaoService,
    private carteiraService: CarteiraService,
    private fb: FormBuilder
  ) {
    this.operacaoForm = this.createOperacaoForm();
    this.filterForm = this.createFilterForm();
  }
  
  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilterSubscription();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadInitialData(): void {
    this.loading = true;
    
    // Carregar carteiras
    this.carteiraService.getCarteiras()
      .pipe(takeUntil(this.destroy$))
      .subscribe(carteiras => {
        this.carteiras = carteiras;
      });
    
    // Carregar criptomoedas
    this.operacaoService.getCriptomoedas()
      .pipe(takeUntil(this.destroy$))
      .subscribe(criptomoedas => {
        this.criptomoedas = criptomoedas;
      });
    
    // Carregar operações
    this.loadOperacoes();
    
    // Carregar resumo
    this.loadSummary();
    
    // Carregar posições
    this.loadPositions();
  }
  
  private loadOperacoes(): void {
    this.operacaoService.getOperacoes(this.activeFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(operacoes => {
        this.operacoes = operacoes;
        this.totalItems = operacoes.length;
        this.agruparOperacoesPorMes(); // Agrupar por mês após carregar
        this.loading = false;
      });
  }
  
  private loadSummary(): void {
    this.operacaoService.getOperacaoSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.summary = summary;
      });
  }
  
  private loadPositions(): void {
    this.operacaoService.getPositionSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(positions => {
        this.positions = positions;
      });
  }
  
  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(filters => {
        this.applyFilters(filters);
      });
  }
  
  private createOperacaoForm(): FormGroup {
    return this.fb.group({
      carteiraId: ['', Validators.required],
      criptomoeda: ['', Validators.required],
      simbolo: ['', Validators.required],
      tipoOperacao: [TipoOperacao.COMPRA, Validators.required],
      quantidade: ['', [Validators.required, Validators.min(0.00000001)]],
      precoUnitario: ['', [Validators.required, Validators.min(0.01)]],
      taxa: [0, [Validators.min(0)]],
      dataOperacao: [new Date().toISOString().split('T')[0], Validators.required],
      observacoes: [''],
      corretoraId: [1, Validators.required],
      hashTransacao: ['']
    });
  }
  
  private createFilterForm(): FormGroup {
    return this.fb.group({
      carteiraId: [''],
      criptomoeda: [''],
      tipoOperacao: [''],
      status: [''],
      dataInicio: [''],
      dataFim: [''],
      corretoraId: ['']
    });
  }
  
  // Métodos de ação
  openForm(operacao?: Operacao): void {
    this.editingOperacao = operacao || null;
    this.showForm = true;
    
    if (operacao) {
      this.operacaoForm.patchValue({
        ...operacao,
        dataOperacao: new Date(operacao.dataOperacao).toISOString().split('T')[0]
      });
    } else {
      this.operacaoForm.reset();
      this.operacaoForm.patchValue({
        tipoOperacao: TipoOperacao.COMPRA,
        taxa: 0,
        dataOperacao: new Date().toISOString().split('T')[0],
        corretoraId: 1
      });
    }
  }
  
  closeForm(): void {
    this.showForm = false;
    this.editingOperacao = null;
    this.operacaoForm.reset();
  }
  
  saveOperacao(): void {
    if (this.operacaoForm.valid) {
      this.loading = true;
      const formValue = this.operacaoForm.value;
      
      const request: CreateOperacaoRequest = {
        ...formValue,
        dataOperacao: new Date(formValue.dataOperacao)
      };
      
      if (this.editingOperacao) {
        this.operacaoService.updateOperacao(this.editingOperacao.id!, request)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.closeForm();
            this.loadOperacoes();
            this.loadSummary();
            this.loadPositions();
          });
      } else {
        this.operacaoService.createOperacao(request)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.closeForm();
            this.loadOperacoes();
            this.loadSummary();
            this.loadPositions();
          });
      }
    }
  }
  
  deleteOperacao(operacao: Operacao): void {
    if (confirm(`Tem certeza que deseja excluir a operação de ${operacao.criptomoeda}?`)) {
      this.operacaoService.deleteOperacao(operacao.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadOperacoes();
          this.loadSummary();
          this.loadPositions();
        });
    }
  }
  
  applyFilters(filters: any): void {
    this.activeFilters = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'dataInicio' || key === 'dataFim') {
          this.activeFilters[key as keyof OperacaoFilter] = new Date(value) as any;
        } else {
          this.activeFilters[key as keyof OperacaoFilter] = value;
        }
      }
    });
    
    this.currentPage = 1;
    this.loadOperacoes();
  }
  
  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadOperacoes();
  }
  
  onCriptomoedaChange(): void {
    const criptomoedaSelecionada = this.operacaoForm.get('criptomoeda')?.value;
    const cripto = this.criptomoedas.find(c => c.nome === criptomoedaSelecionada);
    
    if (cripto) {
      this.operacaoForm.patchValue({
        simbolo: cripto.simbolo,
        precoUnitario: cripto.precoAtual || 0
      });
    }
  }
  
  // Métodos utilitários
  get paginatedOperacoes(): Operacao[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.operacoes.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getStatusClass(status: StatusOperacao): string {
    switch (status) {
      case StatusOperacao.CONFIRMADA:
        return 'status-confirmada';
      case StatusOperacao.PENDENTE:
        return 'status-pendente';
      case StatusOperacao.CANCELADA:
        return 'status-cancelada';
      case StatusOperacao.ERRO:
        return 'status-erro';
      default:
        return '';
    }
  }
  
  getTipoOperacaoClass(tipo: TipoOperacao): string {
    switch (tipo) {
      case TipoOperacao.COMPRA:
        return 'tipo-compra';
      case TipoOperacao.VENDA:
        return 'tipo-venda';
      default:
        return 'tipo-outros';
    }
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
  
  formatNumber(value: number, decimals: number = 8): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // Métodos para agrupamento mensal
  private agruparOperacoesPorMes(): void {
    if (!this.operacoes.length) {
      this.operacoesPorMes = [];
      this.historicoMensal = null;
      return;
    }

    // Ordenar operações por data (mais recente primeiro)
    const operacoesOrdenadas = [...this.operacoes].sort((a, b) => 
      new Date(b.dataOperacao).getTime() - new Date(a.dataOperacao).getTime()
    );

    // Agrupar por mês
    const gruposPorMes = new Map<string, Operacao[]>();
    
    operacoesOrdenadas.forEach(operacao => {
      const data = new Date(operacao.dataOperacao);
      const chaveMs = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (!gruposPorMes.has(chaveMs)) {
        gruposPorMes.set(chaveMs, []);
      }
      gruposPorMes.get(chaveMs)!.push(operacao);
    });

    // Criar estrutura de operações por mês com consolidados
    this.operacoesPorMes = Array.from(gruposPorMes.entries()).map(([chaveMs, operacoes]) => {
      const [ano, mes] = chaveMs.split('-').map(Number);
      const consolidado = this.calcularConsolidadoMensal(operacoes, ano, mes);
      
      return {
        consolidado,
        operacoes: operacoes.sort((a, b) => 
          new Date(b.dataOperacao).getTime() - new Date(a.dataOperacao).getTime()
        )
      };
    });

    // Criar histórico mensal geral
    this.criarHistoricoMensal();
  }

  private calcularConsolidadoMensal(operacoes: Operacao[], ano: number, mes: number): ConsolidadoMensal {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let totalCompras = 0;
    let totalVendas = 0;
    let valorTotalCompras = 0;
    let valorTotalVendas = 0;
    const criptomoedasOperadas = new Set<string>();

    operacoes.forEach(operacao => {
      criptomoedasOperadas.add(operacao.criptomoeda);
      
      if (operacao.tipoOperacao === TipoOperacao.COMPRA) {
        totalCompras++;
        valorTotalCompras += operacao.valorTotal;
      } else if (operacao.tipoOperacao === TipoOperacao.VENDA) {
        totalVendas++;
        valorTotalVendas += operacao.valorTotal;
      }
    });

    return {
      mes: `${nomesMeses[mes - 1]} ${ano}`,
      ano,
      mesNumero: mes,
      totalOperacoes: operacoes.length,
      totalCompras,
      totalVendas,
      valorTotalCompras,
      valorTotalVendas,
      saldoMensal: valorTotalVendas - valorTotalCompras,
      criptomoedasOperadas: Array.from(criptomoedasOperadas)
    };
  }

  private criarHistoricoMensal(): void {
    if (!this.operacoesPorMes.length) {
      this.historicoMensal = null;
      return;
    }

    const todasOperacoes = this.operacoesPorMes.flatMap(mes => mes.operacoes);
    const datas = todasOperacoes.map(op => new Date(op.dataOperacao));
    
    const totalGeral = this.operacoesPorMes.reduce((acc, mes) => 
      acc + mes.consolidado.valorTotalCompras + mes.consolidado.valorTotalVendas, 0
    );
    
    const saldoGeral = this.operacoesPorMes.reduce((acc, mes) => 
      acc + mes.consolidado.saldoMensal, 0
    );

    this.historicoMensal = {
      periodoTotal: {
        dataInicio: new Date(Math.min(...datas.map(d => d.getTime()))),
        dataFim: new Date(Math.max(...datas.map(d => d.getTime()))),
        totalGeral,
        saldoGeral
      },
      meses: this.operacoesPorMes
    };
  }

  // Funções de accordion removidas - não são mais necessárias na estrutura de lista contínua
}