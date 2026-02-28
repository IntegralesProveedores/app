import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-banner-01',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-01.component.html',
  styleUrls: ['./banner-01.component.css']
})
export class Banner01Component {
  @Input() producto!: Producto;
}
