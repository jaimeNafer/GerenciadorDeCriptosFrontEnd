import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperacaoWrapper } from '../models/operacao.model';

@Injectable({
  providedIn: 'root',
})
export class OperacaoService {
  constructor(private http: HttpClient) {}
  getOperacoesByCarteira(carteiraId: number): Observable<OperacaoWrapper[]> {
    return this.http.get<OperacaoWrapper[]>(`http://localhost:8080/v1/carteiras/${carteiraId}/operacoes`);
  }
}