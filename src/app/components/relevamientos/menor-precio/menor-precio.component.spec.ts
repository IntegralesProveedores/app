import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenorPrecioComponent } from './menor-precio.component';

describe('MenorPrecioComponent', () => {
  let component: MenorPrecioComponent;
  let fixture: ComponentFixture<MenorPrecioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenorPrecioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenorPrecioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
