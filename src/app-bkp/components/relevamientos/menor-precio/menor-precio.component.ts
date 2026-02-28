import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menor-precio',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './menor-precio.component.html',
  styleUrl: './menor-precio.component.css'
})
export class MenorPrecioComponent {
  query: string = '';
  response: any[] = [];
  siteId: string = 'MLA';
  offset: number = 0;
  limit: number = 50;
  isLoading: boolean = false;
  hasMore: boolean = true; // Nueva variable para controlar si hay más productos

  constructor(private http: HttpClient) { }

  buscarProductos() {
    this.offset = 0;
    this.response = [];
    this.hasMore = true; // Reiniciar la variable al hacer una nueva búsqueda
    this.loadMore();
  }

  loadMore() {
    if (this.isLoading || !this.hasMore) return; // Si ya no hay más productos, salir

    this.isLoading = true;
    const url = `https://divine-flower-c769.integralesproveedores.workers.dev/relevamientos/menorprecio?q=${encodeURIComponent(this.query)}&limit=${this.limit}&offset=${this.offset}`;

    this.http.get(url).subscribe({
      next: (res: any) => {
        const newResults = res.results.map((item: any, index: number) => ({
          id: item.id,
          title: item.title,
          price: this.formatPrice(item.price),
          currency: item.currency_id,
          available_quantity: item.available_quantity,
          permalink: item.permalink,
          thumbnail: item.thumbnail,
          condition: item.condition,
          store_id: item.official_store_id,
          original_price: item.original_price ? this.formatPrice(item.original_price) : null,
          shipping: item.shipping.free_shipping,
          zone: item.seller_address?.state_name || "Desconocido",
          index: this.response.length + index + 1
        }));

        const uniqueResults = newResults.filter((newItem: any) =>
          !this.response.some((existingItem: any) => existingItem.id === newItem.id)
        );

        this.response = [...this.response, ...uniqueResults].sort((a, b) => a.price - b.price);

        this.offset += this.limit;

        if (newResults.length < this.limit) {
          this.hasMore = false;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // 📌 **Función para agrupar productos por zona**
  agruparPorZona() {
    const grouped = this.response.reduce((acc, item) => {
      const zone = item.zone || 'Desconocido';
      if (!acc[zone]) acc[zone] = [];
      acc[zone].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.keys(grouped).map(zone => ({
      zone,
      items: grouped[zone]
    }));
  }

  // Detectar cuando se llega al final de la pantalla para cargar más resultados
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      this.loadMore();
    }
  }

}
