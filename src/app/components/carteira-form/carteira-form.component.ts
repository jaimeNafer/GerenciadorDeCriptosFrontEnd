import { Component, EventEmitter, Input, OnInit, OnChanges, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Carteira,
  CreateCarteiraRequest,
  UpdateCarteiraRequest,
} from '../../models/carteira.model';
import { Corretora } from '../../models/corretora.model';
import { CarteiraService } from '../../services/carteira.service';

@Component({
  selector: 'app-carteira-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './carteira-form.component.html',
  styleUrls: ['./carteira-form.component.scss'],
})
export class CarteiraFormComponent implements OnInit, OnChanges {
  @Input() carteira: Carteira | null = null;
  @Input() isVisible = false;
  @Output() save = new EventEmitter<Carteira>();
  @Output() cancelled = new EventEmitter<void>();

  carteiraForm: FormGroup;
  corretoras: Corretora[] = [];

  isLoading = false;
  isEditMode = false;

  // Alert properties
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';

  private readonly fb: FormBuilder;
  private readonly carteiraService: CarteiraService;

  constructor() {
    this.fb = inject(FormBuilder);
    this.carteiraService = inject(CarteiraService);
    this.carteiraForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCorretoras();

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
      corretoraId: [null, this.isEditMode ? [] : [Validators.required]],
      excluido: [false],
    });
  }

  private populateForm(): void {
    if (this.carteira) {
      this.carteiraForm.patchValue({
        nome: this.carteira.nome,
        corretoraId: this.carteira.corretoraId,
        excluido: this.carteira.excluido ?? false,
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



  onSubmit(): void {
    if (this.carteiraForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue = this.carteiraForm.value;

      if (this.isEditMode && this.carteira) {
        const updateRequest: UpdateCarteiraRequest = {
          nome: formValue.nome,
          excluido: formValue.excluido,
        };

        // Simular resposta para desenvolvimento
        setTimeout(() => {
          const updatedCarteira: Carteira = {
            ...this.carteira!,
            ...updateRequest,
          };
          this.save.emit(updatedCarteira);
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
          corretora: {
            idCorretora: formValue.corretoraId,
          },
        };

        this.carteiraService.createCarteira(createRequest).subscribe({
          next: (carteira) => {
            this.showAlertMessage('Carteira criada com sucesso!', 'success');
            this.save.emit(carteira);
            this.isLoading = false;
            setTimeout(() => {
              this.resetForm();
            }, 2000); // Aguarda 2 segundos para mostrar o sucesso antes de fechar
          },
          error: (error) => {
            this.isLoading = false;

            if (error.status === 422) {
              // Erro de validação - exibir mensagem específica do backend
              const errorMessage =
                error.error?.message ||
                error.error?.error ||
                'Dados inválidos. Verifique os campos e tente novamente.';
              this.showAlertMessage(errorMessage, 'warning');
            } else {
              // Outros erros - mensagem genérica
              this.showAlertMessage(
                'Erro interno do servidor. Tente novamente mais tarde.',
                'danger'
              );
            }
          },
        });
      }
    }
  }

  onCancelClick(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.carteiraForm.reset();
    this.carteiraForm.patchValue({ excluido: false });
    this.isEditMode = false;
    this.carteira = null;
    this.hideAlert();
  }

  // Alert methods
  showAlertMessage(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Auto-hide success and info alerts after 5 seconds
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

  // Getters para facilitar acesso aos controles do formulário
  get nome() {
    return this.carteiraForm.get('nome');
  }

  get corretoraId() {
    return this.carteiraForm.get('corretoraId');
  }
  get excluido() {
    return this.carteiraForm.get('excluido');
  }
}
