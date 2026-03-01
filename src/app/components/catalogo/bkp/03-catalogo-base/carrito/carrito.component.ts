import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoService, Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent {
  carrito: Producto[] = [];
  dolarVenta = 0;
  expandedId: number | null = null; // para ver medidas al click de imagen

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.carritoService.getCarrito$().subscribe(c => this.carrito = c);
    this.carritoService.getDolarVenta$().subscribe(v => this.dolarVenta = v);
  }

  // +/- / input manual
  incrementar(prod: Producto) {
    this.carritoService.setCantidad(prod.id, (prod.cantidad || 0) + 1);
  }
  decrementar(prod: Producto) {
    this.carritoService.setCantidad(prod.id, Math.max(0, (prod.cantidad || 0) - 1));
  }
  onCantidadInput(prod: Producto) {
    const nueva = Math.max(0, Number(prod.cantidad) || 0);
    this.carritoService.setCantidad(prod.id, nueva);
  }

  eliminarProducto(id: number) {
    this.carritoService.eliminarProducto(id); // también resetea en catálogo/detalle
  }

  vaciarCarrito() {
    this.carritoService.vaciarCarrito();
  }

  toggleInfo(prod: Producto) {
    this.expandedId = this.expandedId === prod.id ? null : prod.id;
  }

  // Totales
  getVolumenTotal() { return this.carritoService.calcularVolumenTotal(); }
  getTotalUSD()     { return this.carritoService.calcularTotalUSD(); }
  getTotalARS()     { return this.carritoService.calcularTotalPesos(); }

  // Formatos
  fmtNumber(n: number, min = 0, max = 0) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: min, maximumFractionDigits: max }).format(n || 0);
  }
  fmtUSD(n: number) { return `USD $ ${this.fmtNumber(n, 0, 0)}`; }
  fmtARS(n: number) { return `ARS $ ${this.fmtNumber(n, 0, 0)}`; }

  confirmarCompra() {
    alert('¡Compra confirmada! Gracias por tu pedido.');
    this.vaciarCarrito();
  }
}
