import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tendencia',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './tendencia.component.html',
  styleUrl: './tendencia.component.css'
})
export class TendenciaComponent {
  response: any[] = [];
  offset: number = 0;
  limit: number = 50;
  isLoading: boolean = false;
  hasMore: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.buscarProductos(); // Carga inicial con la categoría por defecto
  }

  buscarProductos() {
    this.offset = 0;
    this.response = [];
    this.hasMore = true;
    this.loadMore();
  }

  loadMore() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    const url = `https://divine-flower-c769.integralesproveedores.workers.dev/relevamientos/tendencia`;

    this.http.get(url).subscribe({
      next: (res: any) => {
        if (!Array.isArray(res)) {
          console.error('Formato inesperado de la API:', res);
          this.isLoading = false;
          return;
        }

        const newResults = res.map((item: any, index: number) => ({
          keyword: item.keyword,
          url: item.url,
          index: this.response.length + index + 1
        }));

        this.response = [...this.response, ...newResults];
        this.offset += this.limit;
        this.hasMore = false; // No hay paginación

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener tendencias:', err);
        this.isLoading = false;
      }
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      this.loadMore();
    }
  }
}
