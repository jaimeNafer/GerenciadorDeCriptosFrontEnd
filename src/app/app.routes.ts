import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { OperacoesComponent } from './components/operacoes/operacoes';
import { AtivosComponent } from './components/ativos/ativos';
import { ImportacaoComponent } from './components/importacao/importacao';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'operacoes', component: OperacoesComponent },
  { path: 'ativos', component: AtivosComponent },
  { path: 'importacao', component: ImportacaoComponent },
  { path: '**', redirectTo: '/home' }
];
