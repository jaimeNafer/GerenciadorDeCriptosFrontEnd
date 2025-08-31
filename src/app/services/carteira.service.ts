import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Carteira, CreateCarteiraRequest, UpdateCarteiraRequest } from '../models/carteira.model';
import { Corretora, Usuario } from '../models/corretora.model';

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  private carteirasSubject = new BehaviorSubject<Carteira[]>([]);
  public carteiras$ = this.carteirasSubject.asObservable();

  constructor() {
    // Inicialização removida para evitar problemas de dependência circular
    // A inicialização será feita quando necessário
  }

  // Carregar todas as carteiras
  loadCarteiras(): void {
    this.getCarteiras().subscribe(carteiras => {
      this.carteirasSubject.next(carteiras);
    });
  }

  // Obter todas as carteiras (mockado)
  getCarteiras(): Observable<Carteira[]> {
    return of(this.getMockCarteiras());
  }

  // Obter carteira por ID (mockado)
  getCarteiraById(id: number): Observable<Carteira> {
    const carteira = this.getMockCarteiras().find(c => c.id === id);
    return of(carteira!);
  }

  // Criar nova carteira (mockado)
  createCarteira(request: CreateCarteiraRequest): Observable<Carteira> {
    const novaCarteira: Carteira = {
      id: Date.now(),
      nome: request.nome,
      usuarioId: request.usuarioId,
      corretoraId: request.corretoraId,
      dataCriacao: new Date(),
      ativa: true
    };
    
    const carteiras = this.carteirasSubject.value;
    carteiras.push(novaCarteira);
    this.carteirasSubject.next(carteiras);
    
    return of(novaCarteira);
  }

  // Atualizar carteira (mockado)
  updateCarteira(id: number, request: UpdateCarteiraRequest): Observable<Carteira> {
    const carteiras = this.carteirasSubject.value;
    const index = carteiras.findIndex(c => c.id === id);
    
    if (index !== -1) {
      carteiras[index] = { ...carteiras[index], ...request };
      this.carteirasSubject.next(carteiras);
      return of(carteiras[index]);
    }
    
    throw new Error('Carteira não encontrada');
  }

  // Excluir carteira (mockado)
  deleteCarteira(id: number): Observable<void> {
    const carteiras = this.carteirasSubject.value.filter(c => c.id !== id);
    this.carteirasSubject.next(carteiras);
    return of(void 0);
  }

  // Obter corretoras (mockado)
  getCorretoras(): Observable<Corretora[]> {
    return of(this.getMockCorretoras());
  }

  // Obter usuários (mockado)
  getUsuarios(): Observable<Usuario[]> {
    return of(this.getMockUsuarios());
  }

  // Métodos para dados mock (desenvolvimento)
  getMockCarteiras(): Carteira[] {
    return [
      {
        id: 1,
        nome: 'Carteira Principal',
        usuarioId: 1,
        corretoraId: 1,
        dataCriacao: new Date('2024-01-15'),
        ativa: true
      },
      {
        id: 2,
        nome: 'Carteira Day Trade',
        usuarioId: 1,
        corretoraId: 2,
        dataCriacao: new Date('2024-02-01'),
        ativa: true
      }
    ];
  }

  getMockCorretoras(): Corretora[] {
    return [
      { id: 1, nome: 'XP Investimentos', codigo: 'XP', ativa: true },
      { id: 2, nome: 'Rico', codigo: 'RICO', ativa: true },
      { id: 3, nome: 'Clear', codigo: 'CLEAR', ativa: true }
    ];
  }

  getMockUsuarios(): Usuario[] {
    return [
      { id: 1, nome: 'João Silva', email: 'joao@email.com', ativo: true },
      { id: 2, nome: 'Maria Santos', email: 'maria@email.com', ativo: true }
    ];
  }
}