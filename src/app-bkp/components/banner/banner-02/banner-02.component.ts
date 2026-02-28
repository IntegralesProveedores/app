import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-banner-02',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-02.component.html',
  styleUrls: ['./banner-02.component.css']
})
export class Banner02Component {
  @Input() producto!: Producto;
}




