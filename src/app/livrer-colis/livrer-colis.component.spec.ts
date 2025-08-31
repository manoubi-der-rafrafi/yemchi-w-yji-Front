import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivrerColisComponent } from './livrer-colis.component';

describe('LivrerColisComponent', () => {
  let component: LivrerColisComponent;
  let fixture: ComponentFixture<LivrerColisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivrerColisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivrerColisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
