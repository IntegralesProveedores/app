import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService, Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent {
  producto?: Producto;
  dolarVenta = 0;
  cantidadCarrito = 0;

  constructor(private route: ActivatedRoute, private carritoService: CarritoService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.producto = this.carritoService.getProductoPorId(id);

    // Dólar reactivo
    this.carritoService.getDolarVenta$().subscribe(v => this.dolarVenta = v);
    // Badge carrito
    this.carritoService.getCarrito$().subscribe(c => this.cantidadCarrito = c.length);
  }

  incrementar() {
    if (!this.producto) return;
    const nueva = (this.producto.cantidad || 0) + 1;
    this.carritoService.setCantidad(this.producto.id, nueva);
  }

  decrementar() {
    if (!this.producto) return;
    const nueva = Math.max(0, (this.producto.cantidad || 0) - 1);
    this.carritoService.setCantidad(this.producto.id, nueva);
  }

  onCantidadInput() {
    if (!this.producto) return;
    const nueva = Math.max(0, Number(this.producto.cantidad) || 0);
    this.carritoService.setCantidad(this.producto.id, nueva);
  }

  agregarAlCarrito() {
    if (!this.producto) return;
    const nueva = Math.max(0, Number(this.producto.cantidad) || 0);
    this.carritoService.setCantidad(this.producto.id, nueva > 0 ? nueva : 1);
  }

  // Helpers de formato
  fmtNumber(n: number, min = 0, max = 0) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: min, maximumFractionDigits: max }).format(n || 0);
  }
  fmtUSD(n: number) { return `USD $ ${this.fmtNumber(n, 0, 0)}`; }
  fmtARS(n: number) { return `ARS $ ${this.fmtNumber(n, 0, 0)}`; }
}
