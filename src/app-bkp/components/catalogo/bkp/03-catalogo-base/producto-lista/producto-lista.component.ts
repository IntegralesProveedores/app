import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoService, Producto } from '../../../services/carrito.service';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './producto-lista.component.html',
  styleUrls: ['./producto-lista.component.css']
})
export class ProductoListaComponent {
  productos: Producto[] = [];
  dolarVenta = 0;
  cantidadCarrito = 0;

  constructor(public carritoService: CarritoService) {}

  ngOnInit() {
    // Catálogo reactivo (mantiene cantidades sincronizadas con el carrito)
    this.carritoService.getProductos$().subscribe(list => this.productos = list);

    // Dólar
    this.carritoService.getDolarVenta$().subscribe(v => this.dolarVenta = v);

    // Badge carrito
    this.carritoService.getCarrito$().subscribe(c => this.cantidadCarrito = c.length);
  }

  incrementar(prod: Producto) {
    const nueva = (prod.cantidad || 0) + 1;
    this.carritoService.setCantidad(prod.id, nueva);
  }

  decrementar(prod: Producto) {
    const nueva = Math.max(0, (prod.cantidad || 0) - 1);
    this.carritoService.setCantidad(prod.id, nueva);
  }

  // Al tipear manualmente en el input
  onCantidadInput(prod: Producto) {
    const nueva = Math.max(0, Number(prod.cantidad) || 0);
    this.carritoService.setCantidad(prod.id, nueva);
  }

  agregarAlCarrito(prod: Producto) {
    // Se mantiene por si querés el botón; solo asegura el setCantidad
    const nueva = Math.max(0, Number(prod.cantidad) || 0);
    this.carritoService.setCantidad(prod.id, nueva > 0 ? nueva : 1);
  }

  // Helpers de formato (es-AR)
  fmtNumber(n: number, min = 0, max = 0) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: min, maximumFractionDigits: max }).format(n || 0);
  }
  fmtUSD(n: number) { return `USD $ ${this.fmtNumber(n, 0, 0)}`; }
  fmtARS(n: number) { return `ARS $ ${this.fmtNumber(n, 0, 0)}`; }
}
