import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoService, Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-banner-bienvenida',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './banner-bienvenida.component.html',
  styleUrl: './banner-bienvenida.component.css'
})
export class BannerBienvenidaComponent {
  productos: Producto[] = [];

}
