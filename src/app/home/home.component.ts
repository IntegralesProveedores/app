import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavBarComponent } from '../home/nav-bar/nav-bar.component';
import { BannerPrincipalComponent } from '../home/banner-principal/banner-principal.component';
import { BannerMacetaComponent } from '../home/banner-maceta/banner-maceta.component';
import { VentajasComponent } from '../home/ventajas/ventajas.component';
import { ServiciosComponent } from '../home/servicios/servicios.component';
import { ContactoComponent } from '../home/contacto/contacto.component';
import { FooterComponent } from '../home/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    NavBarComponent,
    BannerPrincipalComponent,
    BannerMacetaComponent,
    VentajasComponent,
    ServiciosComponent,
    ContactoComponent,
    FooterComponent,
  ]
})
export class HomeComponent implements OnInit {

  constructor() {  }

  ngOnInit(): void {

  }

}
