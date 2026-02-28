import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoService, Producto } from '../../../services/carrito.service';
import emailjs from '@emailjs/browser';

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
  expandedId: number | null = null;

  // Datos del formulario
  nombre: string = '';
  codArea: string = '';
  celular: string = '';
  email: string = '';

  // Estado
  vistaPreviaHTML: string = '';
  pedidoEnviado: boolean = false;
  formSubmitted: boolean = false;

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.carritoService.getCarrito$().subscribe(c => this.carrito = c);
    this.carritoService.getDolarVenta$().subscribe(v => this.dolarVenta = v);
  }

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
    this.carritoService.eliminarProducto(id);
  }

  vaciarCarrito() {
    this.carritoService.vaciarCarrito();
  }

  toggleInfo(prod: Producto) {
    this.expandedId = this.expandedId === prod.id ? null : prod.id;
  }

  getVolumenTotal() {
    return this.carritoService.calcularVolumenTotal();
  }
  getTotalUSD() {
    return this.carritoService.calcularTotalUSD();
  }
  getTotalARS() {
    return this.carritoService.calcularTotalPesos();
  }

  fmtNumber(n: number, min = 0, max = 0) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: min, maximumFractionDigits: max }).format(n || 0);
  }
  fmtUSD(n: number) { return `USD $ ${this.fmtNumber(n, 0, 0)}`; }
  fmtARS(n: number) { return `ARS $ ${this.fmtNumber(n, 0, 0)}`; }

  private generarHTMLCorreo(): string {
    let html = `
      <div>
        <h2>Detalle de la compra</h2>
        <p><strong>Nombre:</strong> ${this.nombre}</p>
        <p><strong>Teléfono:</strong> (${this.codArea}) ${this.celular}</p>
        <p><strong>Email:</strong> ${this.email}</p>
        <table width="80%">
          <thead>
            <tr>
              <th style="border-bottom:1px solid #ccc; text-align:left;">Producto</th>
              <th style="border-bottom:1px solid #ccc; text-align:right;">USD</th>
              <th style="border-bottom:1px solid #ccc; text-align:right;">ARS</th>
              <th style="border-bottom:1px solid #ccc; text-align:right;">Cantidad</th>
              <th style="border-bottom:1px solid #ccc; text-align:right;">Volumen</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.carrito.forEach(prod => {
      html += `
        <tr>
          <td style="padding:5px;">${prod.nombre}</td>
          <td style="padding:5px; text-align:right;">${this.fmtUSD(prod.precioUsd)}</td>
          <td style="padding:5px; text-align:right;">${this.fmtARS(prod.precioUsd * this.dolarVenta)}</td>
          <td style="padding:5px; text-align:right;">${prod.cantidad}</td>
		  <td style="padding:5px; text-align:right;">
            ${this.fmtNumber((prod.volumenCc || 0) * (prod.unidadesPorPack || 0) * (prod.cantidad || 0))} cc
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p style="text-align:left; margin-top:10px;"><strong>Volumen Total:</strong> ${this.fmtNumber(this.getVolumenTotal(), 0, 0)} cc</p>
        <p style="text-align:left;"><strong>Total USD:</strong> ${this.fmtUSD(this.getTotalUSD())}</p>
        <p style="text-align:left;"><strong>Total ARS:</strong> ${this.fmtARS(this.getTotalARS())}</p>
        <hr>
        <p style="font-style:italic; font-size:0.9em;">El envío está a cargo del comprador y se despacha a las 48 hs de acreditado el pago.</p>
      </div>
    `;

    return html;
  }

  enviarCompra() {
    this.formSubmitted = true;

    if (!this.nombre || !this.codArea || !this.celular || !this.email) {
      return;
    }

    const mensajeHTML = this.generarHTMLCorreo();

    const templateParams = {
      name: this.nombre,
      email: this.email,
      telefono: `(${this.codArea}) ${this.celular}`,
      order_id: Math.floor(Math.random() * 1000000),
      mensaje_html: mensajeHTML
    };

    emailjs.send(
      'service_q9ivf9b',
      'template_imfgs1r',
      templateParams,
      'mh-L6Epb_NpRXUkMa'
    )
    .then(() => {
      this.vaciarCarrito();
      this.pedidoEnviado = true;
    })
    .catch((error) => {
      console.error('Error al enviar el correo:', error);
      this.pedidoEnviado = false;
    });
  }
}
