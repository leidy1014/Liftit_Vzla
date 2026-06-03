import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosLista } from './productos-lista';

describe('ProductosLista', () => {
  let component: ProductosLista;
  let fixture: ComponentFixture<ProductosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
