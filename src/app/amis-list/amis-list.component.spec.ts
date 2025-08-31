import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmisListComponent } from './amis-list.component';

describe('AmisListComponent', () => {
  let component: AmisListComponent;
  let fixture: ComponentFixture<AmisListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmisListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmisListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
