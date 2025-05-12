import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mas-vendidos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './mas-vendidos.component.html',
  styleUrl: './mas-vendidos.component.css'
})
export class MasVendidosComponent {
  categorias: any[] = [];
  category: string = 'MLA5725'; // Categoría por defecto
  response: any[] = [];
  offset: number = 0;
  limit: number = 50;
  isLoading: boolean = false;
  hasMore: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.obtenerCategorias();
    this.buscarProductos(); // Carga inicial con la categoría por defecto
  }

  obtenerCategorias() {
    this.http.get<any[]>('https://divine-flower-c769.integralesproveedores.workers.dev/categorias')
      .subscribe({
        next: (data) => {
          this.categorias = data;
        },
        error: (err) => console.error('Error al obtener categorías:', err)
      });
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
    const url = `https://divine-flower-c769.integralesproveedores.workers.dev/relevamientos/masvendidos?category=${this.category}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        if (!Array.isArray(res)) {
          console.error('Respuesta inesperada de la API:', res);
          this.isLoading = false;
          return;
        }

        // Filtrar solo los productos válidos (code: 200) y extraer los datos
        const newResults = res
          .filter(item => item.code === 200 && item.body) // Ignorar errores 404
          .map(item => ({
            id: item.body.id,
            title: item.body.title,
            price: item.body.price,
            thumbnail: item.body.thumbnail,
            permalink: item.body.permalink,
            index: this.response.length + 1 // Mantener numeración
          }));

        this.response = [...this.response, ...newResults];
        this.offset += this.limit;
        this.hasMore = false; // No hay paginación

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
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
