import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingQuoteComponent } from './shipping-quote.component';

describe('ShippingQuoteComponent', () => {
  let component: ShippingQuoteComponent;
  let fixture: ComponentFixture<ShippingQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingQuoteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShippingQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
