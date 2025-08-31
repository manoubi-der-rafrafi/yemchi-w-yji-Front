import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProduitAdminComponent } from './form-produit-admin.component';

describe('FormProduitAdminComponent', () => {
  let component: FormProduitAdminComponent;
  let fixture: ComponentFixture<FormProduitAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormProduitAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormProduitAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
