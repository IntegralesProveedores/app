import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerMacetaOlivoComponent } from './banner-maceta-olivo.component';

describe('BannerMacetaOlivoComponent', () => {
  let component: BannerMacetaOlivoComponent;
  let fixture: ComponentFixture<BannerMacetaOlivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerMacetaOlivoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannerMacetaOlivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
