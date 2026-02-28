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
  product: any = null;
  error: string | null = null;

  private tokenUrl = 'https://integrales.com.ar/api/token'; // Tu endpoint para el token
  private apiUrl = 'https://api.mercadolibre.com/items?ids=MLA2000520062';

  constructor(private http: HttpClient) {
    this.fetchProduct();
  }

  fetchProduct() {
    this.getAccessToken().then((accessToken) => {
      if (accessToken) {
        this.http.get(this.apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }).subscribe({
          next: (data: any) => {
            if (data.length > 0 && data[0].body) {
              this.product = data[0].body;
              console.log(this.product); // Verificación en consola
            } else {
              this.error = 'Error al cargar el producto.';
            }
          },
          error: (err) => {
            console.error('Error fetching product:', err);
            this.error = 'Hubo un problema al cargar el producto.';
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
