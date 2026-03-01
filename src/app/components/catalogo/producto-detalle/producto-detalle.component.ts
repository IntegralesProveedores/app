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

  // cantidad que se muestra/edita en el input
  qty = 0;

  // badge carrito
  cantidadCarrito = 0;

  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    // Mantener el producto SIEMPRE sincronizado con el servicio
    this.carritoService.getProductos$().subscribe(productos => {
      const p = productos.find(x => x.id === this.id);
      this.producto = p;
      // Cuando el servicio emite, reflejamos la cantidad actual en el input
      this.qty = p?.cantidad ?? 0;
    });

    // Dólar reactivo
    this.carritoService.getDolarVenta$().subscribe(v => (this.dolarVenta = v));

    // Badge del carrito (cantidad de líneas en carrito)
    this.carritoService.getCarrito$().subscribe(c => (this.cantidadCarrito = c.length));
  }

  // === Interacciones ===
  incrementar() {
    this.qty = (this.qty || 0) + 1;
    this.grabarCantidad();
  }

  decrementar() {
    this.qty = Math.max(0, (this.qty || 0) - 1);
    this.grabarCantidad();
  }

  onCantidadInput() {
    // normalizar entrada manual
    const n = Number(this.qty);
    this.qty = isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    this.grabarCantidad();
  }

  agregarAlCarrito() {
    // Mantengo este botón por si querés dejarlo visible:
    // si qty es 0, agrego 1; sino, uso qty actual.
    this.qty = this.qty > 0 ? this.qty : 1;
    this.grabarCantidad();
  }

  private grabarCantidad() {
    // Escribimos en el servicio; esto dispara emisión y
    // gracias a la suscripción de arriba, el detalle queda sincronizado.
    this.carritoService.setCantidad(this.id, this.qty);
  }

  // === Helpers de formato ===
  fmtNumber(n: number, min = 0, max = 0) {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: min,
      maximumFractionDigits: max
    }).format(n || 0);
  }
  fmtUSD(n: number) {
    return `USD $ ${this.fmtNumber(n, 0, 0)}`;
  }
  fmtARS(n: number) {
    return `ARS $ ${this.fmtNumber(n, 0, 0)}`;
  }
}
