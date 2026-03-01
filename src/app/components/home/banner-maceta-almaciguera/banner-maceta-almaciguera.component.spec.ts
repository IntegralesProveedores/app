import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerMacetaAlmacigueraComponent } from './banner-maceta-almaciguera.component';

describe('BannerMacetaAlmacigueraComponent', () => {
  let component: BannerMacetaAlmacigueraComponent;
  let fixture: ComponentFixture<BannerMacetaAlmacigueraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerMacetaAlmacigueraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannerMacetaAlmacigueraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
