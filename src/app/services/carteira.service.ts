import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Carteira, CreateCarteiraRequest, UpdateCarteiraRequest } from '../models/carteira.model';
import { Corretora } from '../models/corretora.model';

@Injectable({
  providedIn: 'root',
})
export class CarteiraService {
  private readonly apiUrl = 'http://localhost:8080/v1/carteiras';
  private carteirasSubject = new BehaviorSubject<Carteira[]>([]);
  public carteiras$ = this.carteirasSubject.asObservable();

  constructor(private http: HttpClient) {
    // Inicialização removida para evitar problemas de dependência circular
    // A inicialização será feita quando necessário
  }

  // Carregar todas as carteiras
  loadCarteiras(): void {
    this.getCarteiras().subscribe((carteiras) => {
      this.carteirasSubject.next(carteiras);
    });
  }

  // Obter todas as carteiras da API
  getCarteiras(): Observable<Carteira[]> {
    return this.http.get<Carteira[]>(this.apiUrl);
  }

  // Método para obter carteiras mockadas (mantido para fallback)
  getCarteirasMock(): Observable<Carteira[]> {
    return of(this.getMockCarteiras());
  }

  // Obter carteira por ID (mockado)
  getCarteiraById(id: number): Observable<Carteira> {
    const carteira = this.getMockCarteiras().find((c) => c.idCarteira === id);
    return of(carteira!);
  }

  // Criar nova carteira
  createCarteira(request: CreateCarteiraRequest): Observable<Carteira> {
    return this.http.post<Carteira>(this.apiUrl, request);
  }

  // Atualizar carteira (mockado)
  updateCarteira(id: number, request: UpdateCarteiraRequest): Observable<Carteira> {
    const carteiras = this.carteirasSubject.value;
    const index = carteiras.findIndex((c) => c.idCarteira === id);

    if (index !== -1) {
      carteiras[index] = { ...carteiras[index], ...request };
      this.carteirasSubject.next(carteiras);
      return of(carteiras[index]);
    }

    throw new Error('Carteira não encontrada');
  }

  // Excluir carteira
  deleteCarteira(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obter corretoras da API
  getCorretoras(): Observable<Corretora[]> {
    return this.http.get<Corretora[]>('http://localhost:8080/v1/corretoras');
  }



  // Métodos para dados mock (desenvolvimento)
  getMockCarteiras(): Carteira[] {
    return [
      {
        idCarteira: 43,
        nome: 'Jaime Binance',
        excluido: false,
        corretora: {
          idCorretora: 1,
          nome: 'Binance'
        }
      },
      {
        idCarteira: 44,
        nome: 'Jaime Mercado Bitcoin',
        excluido: true,
        corretora: {
          idCorretora: 2,
          nome: 'Mercado Bitcoin'
        }
      }
    ];
  }

  getMockCorretoras(): Corretora[] {
    return [
      { idCorretora: 1, nome: 'XP Investimentos', codigo: 'XP', ativa: true },
      { idCorretora: 2, nome: 'Rico', codigo: 'RICO', ativa: true },
      { idCorretora: 3, nome: 'Clear', codigo: 'CLEAR', ativa: true },
    ];
  }


}