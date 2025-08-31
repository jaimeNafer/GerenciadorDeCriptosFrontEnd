import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Carteira, CreateCarteiraRequest, UpdateCarteiraRequest } from '../../models/carteira.model';
import { Corretora, Usuario } from '../../models/corretora.model';
import { CarteiraService } from '../../services/carteira.service';

@Component({
  selector: 'app-carteira-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './carteira-form.component.html',
  styleUrls: ['./carteira-form.component.scss']
})
export class CarteiraFormComponent implements OnInit {
  @Input() carteira: Carteira | null = null;
  @Input() isVisible: boolean = false;
  @Output() onSave = new EventEmitter<Carteira>();
  @Output() onCancel = new EventEmitter<void>();

  carteiraForm: FormGroup;
  corretoras: Corretora[] = [];
  usuarios: Usuario[] = [];
  isLoading = false;
  isEditMode = false;

  constructor(private readonly fb: FormBuilder, private readonly carteiraService: CarteiraService) {
    this.carteiraForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCorretoras();
    this.loadUsuarios();
    
    if (this.carteira) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.carteira && this.carteiraForm) {
      this.isEditMode = true;
      this.populateForm();
    } else if (!this.carteira && this.carteiraForm) {
      this.isEditMode = false;
      this.carteiraForm.reset();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      usuarioId: ['', Validators.required],
      corretoraId: ['', Validators.required],
      ativa: [true]
    });
  }

  private populateForm(): void {
    if (this.carteira) {
      this.carteiraForm.patchValue({
        nome: this.carteira.nome,
        usuarioId: this.carteira.usuarioId,
        corretoraId: this.carteira.corretoraId,
        ativa: this.carteira.ativa ?? true
      });
    }
  }

  private loadCorretoras(): void {
    // Usando dados mock por enquanto
    this.corretoras = this.carteiraService.getMockCorretoras();
    
    // Para usar API real, descomente:
    // this.carteiraService.getCorretoras().subscribe({
    //   next: (corretoras) => this.corretoras = corretoras,
    //   error: (error) => console.error('Erro ao carregar corretoras:', error)
    // });
  }

  private loadUsuarios(): void {
    // Usando dados mock por enquanto
    this.usuarios = this.carteiraService.getMockUsuarios();
    
    // Para usar API real, descomente:
    // this.carteiraService.getUsuarios().subscribe({
    //   next: (usuarios) => this.usuarios = usuarios,
    //   error: (error) => console.error('Erro ao carregar usuários:', error)
    // });
  }

  onSubmit(): void {
    if (this.carteiraForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue = this.carteiraForm.value;

      if (this.isEditMode && this.carteira) {
        const updateRequest: UpdateCarteiraRequest = {
          nome: formValue.nome,
          ativa: formValue.ativa
        };
        
        // Simular resposta para desenvolvimento
        setTimeout(() => {
          const updatedCarteira: Carteira = {
            ...this.carteira!,
            ...updateRequest
          };
          this.onSave.emit(updatedCarteira);
          this.isLoading = false;
          this.resetForm();
        }, 1000);
        
        // Para usar API real, descomente:
        // this.carteiraService.updateCarteira(this.carteira.id!, updateRequest).subscribe({
        //   next: (carteira) => {
        //     this.onSave.emit(carteira);
        //     this.isLoading = false;
        //     this.resetForm();
        //   },
        //   error: (error) => {
        //     console.error('Erro ao atualizar carteira:', error);
        //     this.isLoading = false;
        //   }
        // });
      } else {
        const createRequest: CreateCarteiraRequest = {
          nome: formValue.nome,
          usuarioId: formValue.usuarioId,
          corretoraId: formValue.corretoraId
        };
        
        // Simular resposta para desenvolvimento
        setTimeout(() => {
          const newCarteira: Carteira = {
            id: Date.now(), // ID temporário
            ...createRequest,
            dataCriacao: new Date(),
            ativa: true
          };
          this.onSave.emit(newCarteira);
          this.isLoading = false;
          this.resetForm();
        }, 1000);
        
        // Para usar API real, descomente:
        // this.carteiraService.createCarteira(createRequest).subscribe({
        //   next: (carteira) => {
        //     this.onSave.emit(carteira);
        //     this.isLoading = false;
        //     this.resetForm();
        //   },
        //   error: (error) => {
        //     console.error('Erro ao criar carteira:', error);
        //     this.isLoading = false;
        //   }
        // });
      }
    }
  }

  onCancelClick(): void {
    this.resetForm();
    this.onCancel.emit();
  }

  private resetForm(): void {
    this.carteiraForm.reset();
    this.carteiraForm.patchValue({ ativa: true });
    this.isEditMode = false;
    this.carteira = null;
  }

  // Getters para facilitar acesso aos controles do formulário
  get nome() { return this.carteiraForm.get('nome'); }
  get usuarioId() { return this.carteiraForm.get('usuarioId'); }
  get corretoraId() { return this.carteiraForm.get('corretoraId'); }
  get ativa() { return this.carteiraForm.get('ativa'); }
}