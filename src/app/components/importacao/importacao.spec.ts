import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Importacao } from './importacao';

describe('Importacao', () => {
  let component: Importacao;
  let fixture: ComponentFixture<Importacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Importacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
