import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {
  products: any[] = [];
  error: string | null = null;

  private tokenUrl = 'https://integrales.com.ar/api/token';
  private apiUrl = 'https://api.mercadolibre.com/sites/MLA/search?nickname=INTEGRALES';
  constructor(private http: HttpClient) {
    this.fetchProducts();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  fetchProducts() {
    this.getAccessToken().then((accessToken) => {
      if (accessToken) {
        this.http.get(this.apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }).subscribe({
          next: (data: any) => {
            this.products = data.results.map((product: any) => ({
              title: product.title,
              thumbnail: product.thumbnail,
              price: this.formatPrice(product.price),
              permalink: product.permalink,
              availableQuantity: product.available_quantity,
            })) ?? [];

            if (this.products.length === 0) {
              this.error = 'No se encontraron productos.';
            }
          },
          error: (err) => {
            console.error('Error al obtener los productos:', err);
            this.error = 'Hubo un problema al cargar los productos.';
          }
        });
      } else {
        this.error = 'No se pudo obtener el token de acceso.';
      }
    });
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const response: any = await this.http.get(this.tokenUrl).toPromise();
      return response?.access_token ?? null;
    } catch (err) {
      console.error('Error al obtener el token:', err);
      return null;
    }
  }

}
