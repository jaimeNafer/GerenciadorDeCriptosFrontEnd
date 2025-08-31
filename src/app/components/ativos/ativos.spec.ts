import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ativos } from './ativos';

describe('Ativos', () => {
  let component: Ativos;
  let fixture: ComponentFixture<Ativos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ativos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ativos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
