import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryAccessPanelComponent } from './history-access-panel.component';

describe('HistoryAccessPanelComponent', () => {
  let component: HistoryAccessPanelComponent;
  let fixture: ComponentFixture<HistoryAccessPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryAccessPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryAccessPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
