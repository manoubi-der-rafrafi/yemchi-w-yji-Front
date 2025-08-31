import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTransportComponent } from './contact-transport.component';

describe('ContactTransportComponent', () => {
  let component: ContactTransportComponent;
  let fixture: ComponentFixture<ContactTransportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactTransportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
