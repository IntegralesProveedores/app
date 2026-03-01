import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerBienvenidaComponent } from './banner-bienvenida.component';

describe('BannerBienvenidaComponent', () => {
  let component: BannerBienvenidaComponent;
  let fixture: ComponentFixture<BannerBienvenidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerBienvenidaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannerBienvenidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
