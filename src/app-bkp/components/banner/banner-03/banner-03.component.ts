import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-banner-03',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-03.component.html',
  styleUrl: './banner-03.component.css'
})
export class Banner03Component {
  @Input() producto!: Producto;
}





