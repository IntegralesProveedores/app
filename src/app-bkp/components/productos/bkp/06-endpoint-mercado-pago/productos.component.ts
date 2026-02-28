import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent {
  products: Producto[] = [];
  error: string | null = null;
  loading: boolean = true;
  selectedProduct: any = null; 


  private tokenUrl = 'https://divine-flower-c769.integralesproveedores.workers.dev/token';
  private apiUrl = 'https://divine-flower-c769.integralesproveedores.workers.dev/productos';
  private preferencia = 'https://divine-flower-c769.integralesproveedores.workers.dev/crear-preferencia';

  constructor(private http: HttpClient) {
    this.fetchProducts();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  fetchProducts() {
    this.getAccessToken().then((accessToken) => {
      if (!accessToken) {
        this.error = 'No se pudo obtener el token de acceso.';
        this.loading = false;
        return;
      }

      this.http.get<Producto[]>(this.apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).subscribe({
        next: (data) => {
          this.products = data;
          if (this.products.length === 0) {
            this.error = 'No hay productos disponibles.';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error al obtener los productos:', err);
          this.error = 'Hubo un problema al cargar los productos.';
          this.loading = false;
        }
      });
    });
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const response: any = await firstValueFrom(this.http.get(this.tokenUrl));
      return response?.access_token ?? null;
    } catch (err) {
      console.error('❌ Error al obtener el token:', err);
      return null;
    }
  }




iniciarPago(product: any) {
  this.selectedProduct = product;

  this.http.post<{ id: string }>('https://divine-flower-c769.integralesproveedores.workers.dev/crear-preferencia', {
    title: product.title,
    price: product.price
  }).subscribe({
    next: (res) => this.loadBrick(res.id),
    error: (err) => {
      console.error('Error al crear preferencia', err);
      this.error = 'No se pudo iniciar el pago.';
    }
  });
}

loadBrick(preferenceId: string) {
  const scriptId = 'mp-brick-script';
  const existingScript = document.getElementById(scriptId);
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = 'https://sdk.mercadopago.com/js/v2';
  script.onload = () => {
    const mp = new (window as any).MercadoPago('APP_USR-1aff48a0-4c98-4fd2-a65c-f4d398a40205', {
      locale: 'es-AR'
    });

    mp.bricks().create('wallet', 'checkout-container', {
      initialization: {
        preferenceId: preferenceId
      },
      customization: {
        texts: {
          valueProp: 'smart_option'
        }
      }
    });
  };

  document.body.appendChild(script);
}







}

interface Producto {
  id: number;
  title: string;
  price: number;
  currency_id: string;
  thumbnail: string;
  permalink: string;
  pictures?: { url: string }[];
}
