import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

// carteiras.component.ts (mesmo componente da Carteira com os gráficos)
type TipoAtivo = 'Cripto' | 'Ação' | 'FII' | 'ETF';

interface Ativo {
  id: string;
  simbolo: string;
  nome: string;
  quantidade: number;
  precoMedio: number;
  investido: number;
  precoAtual: number;
  valorAtual: number;
  plValor: number;
  plPct: number;
  corretora?: string;
  tipo?: TipoAtivo;
  ultimaAtualizacao?: string | Date;
}

@Component({
  selector: 'app-ativos',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ativos.html',
  styleUrl: './ativos.scss',
})
export class AtivosComponent implements AfterViewInit, OnDestroy {
  patrimonioTotal = 304764.8;
  valorInvestido = 233262.3;
  variacaoPct = 31.0;
  variacaoAbs = 71502.5;
  rentabilidadePct = -95.58;

  lucroTotal = 71502.5;
  ganhoCapital = 71502.5;
  dividendos = 0;
  proventos12m = 0;
  proventosTotal = 0;

  private chartPat?: echarts.ECharts;
  private chartDonut?: echarts.ECharts;
  private resizeObs?: () => void;

  // filtros
  busca = '';
  filtroTipo = '';
  filtroCorretora = '';

  tiposDisponiveis: string[] = ['Cripto']; // ajuste conforme seu domínio
  corretorasDisponiveis: string[] = ['Binance', 'Rico', 'XP']; // exemplo

  ativos: Ativo[] = [
    // EXEMPLOS – troque pelos dados reais do seu backend
    {
      id: 'BTC',
      simbolo: 'BTC',
      nome: 'Bitcoin',
      tipo: 'Cripto',
      corretora: 'Binance',
      quantidade: 0.3,
      precoMedio: 180000,
      investido: 54000,
      precoAtual: 220000,
      valorAtual: 66000,
      plValor: 12000,
      plPct: 22.22,
      ultimaAtualizacao: new Date(),
    },
    {
      id: 'ADA',
      simbolo: 'ADA',
      nome: 'Cardano',
      tipo: 'Cripto',
      corretora: 'Binance',
      quantidade: 1000,
      precoMedio: 2.2,
      investido: 2200,
      precoAtual: 1.9,
      valorAtual: 1900,
      plValor: -300,
      plPct: -13.64,
      ultimaAtualizacao: new Date(),
    },
  ];

  ativosFiltrados: Ativo[] = [];

  // totais
  totalInvestido = 0;
  totalAtual = 0;
  totalPL = 0;
  get totalPLPct(): number {
    return this.totalInvestido > 0 ? (this.totalPL / this.totalInvestido) * 100 : 0;
  }

  constructor() {
    this.aplicarFiltro();
  }

  ngAfterViewInit(): void {
    // Patrimônio (barra empilhada)
    const el1 = document.getElementById('chartPatrimonio');
    if (el1) {
      this.chartPat = echarts.init(el1);
      this.chartPat.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['Valor aplicado', 'Ganho capital'] },
        grid: { left: 40, right: 12, top: 30, bottom: 30 },
        xAxis: {
          type: 'category',
          data: [
            '08/24',
            '09/24',
            '10/24',
            '11/24',
            '12/24',
            '01/25',
            '02/25',
            '03/25',
            '04/25',
            '05/25',
            '06/25',
            '07/25',
            '08/25',
          ],
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Valor aplicado',
            type: 'bar',
            stack: 'total',
            data: [50, 80, 100, 180, 200, 220, 240, 250, 260, 230, 220, 260, 260],
          },
          {
            name: 'Ganho capital',
            type: 'bar',
            stack: 'total',
            data: [10, 5, 10, 80, 70, 70, 20, -30, -40, 20, 80, 50, 60],
            barGap: '5%',
          },
        ],
      });
    }

    // Composição (doughnut)
    const el2 = document.getElementById('chartDonut');
    if (el2) {
      this.chartDonut = echarts.init(el2);
      this.chartDonut.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
        legend: { bottom: 0 },
        series: [
          {
            name: 'Composição',
            type: 'pie',
            radius: ['60%', '85%'],
            avoidLabelOverlap: true,
            label: { show: false },
            data: [{ value: 100, name: 'Criptos' }],
          },
        ],
      });
    }

    // Resize responsivo
    const handler = () => {
      this.chartPat?.resize();
      this.chartDonut?.resize();
    };
    window.addEventListener('resize', handler);
    this.resizeObs = () => window.removeEventListener('resize', handler);
  }

  setPeriodo(_m: number) {
    /* TODO: trocar dados e chamar this.chartPat?.setOption(...) */
  }

  ngOnDestroy(): void {
    this.chartPat?.dispose();
    this.chartDonut?.dispose();
    this.resizeObs?.();
  }
  aplicarFiltro(): void {
    const busca = (this.busca || '').trim().toLowerCase();
    this.ativosFiltrados = this.ativos.filter((a) => {
      const passaBusca =
        !busca || a.simbolo.toLowerCase().includes(busca) || a.nome.toLowerCase().includes(busca);
      const passaTipo = !this.filtroTipo || a.tipo === this.filtroTipo;
      const passaCorretora = !this.filtroCorretora || a.corretora === this.filtroCorretora;
      return passaBusca && passaTipo && passaCorretora;
    });

    // recomputa totais
    this.totalInvestido = this.ativosFiltrados.reduce((s, a) => s + a.investido, 0);
    this.totalAtual = this.ativosFiltrados.reduce((s, a) => s + a.valorAtual, 0);
    this.totalPL = this.totalAtual - this.totalInvestido;
  }

  // helpers
  trackByAtivo = (_: number, a: Ativo) => a.id ?? a.simbolo;

  formatNumber(n: number): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 }).format(n);
  }
  formatDate(d?: string | Date): string {
    if (!d) return '-';
    const dd = typeof d === 'string' ? new Date(d) : d;
    return new Intl.DateTimeFormat('pt-BR').format(dd);
  }

  // ações (stub)
  verOperacoes(a: Ativo) {
    /* navega para tela de operações filtrada por ativo */
  }
  detalhar(a: Ativo) {
    /* abre modal/gráfico detalhado do ativo */
  }
}
