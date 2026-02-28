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
  cuit: string = '';

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
        <h2>Detalle de compra</h2>
        <p><strong>Nombre:</strong> ${this.nombre}</p>
        <p><strong>CUIT:</strong> ${this.cuit}</p>
        <p><strong>Teléfono:</strong> (${this.codArea}) ${this.celular}</p>
        <p><strong>Email:</strong> ${this.email}</p>
        <table width="80%">
          <thead>
            <tr>
              <th style="border-bottom:1px solid #ccc; text-align:left;">Producto</th>
              <th style="border-bottom:1px solid #ccc; text-align:left;">Medidas</th>
              <th style="border-bottom:1px solid #ccc; text-align:left;;">Volumen</th>
              <th style="border-bottom:1px solid #ccc; text-align:left;">Presentación</th>
              <th style="border-bottom:1px solid #ccc; text-align:right;">Cantidad</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.carrito.forEach(prod => {
      html += `
			<tr>
			  <td style="padding:5px;">${prod.nombre}</td>
			  <td style="padding:5px;">${prod.medidas}</td>
			  <td style="padding:5px;">${prod.volumenCc} cm<sup>3</sup></td>
			  <td style="padding:5px;">${prod.presentacion}</td>
			  <td style="padding:5px; text-align:right; font-size:1.3em;"><strong>${prod.cantidad}</strong></td>
			</tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p>A la brevedad nos pondremos en contacto con usted.</p>
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
