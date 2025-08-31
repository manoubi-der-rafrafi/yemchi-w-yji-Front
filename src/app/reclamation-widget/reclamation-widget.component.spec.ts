import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationWidgetComponent } from './reclamation-widget.component';

describe('ReclamationWidgetComponent', () => {
  let component: ReclamationWidgetComponent;
  let fixture: ComponentFixture<ReclamationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
