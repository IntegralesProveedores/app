import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  medidas: string;
  presentacion: string;
  volumenCc: number;
  unidadesPorPack: number;
  imagen: string;
  cantidad: number;
  precioUsd: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private dolarVenta = 0;
  private isBrowser: boolean;

	private _productos: Producto[] = [

	  {
		id: 0,
		nombre: 'Semillera',
		medidas: '26 x 20 x 2 cm (h)',
		presentacion: 'Pack x960u.',
		volumenCc: 6,
		unidadesPorPack: 20,
		imagen: 'assets/images/producto-maceta-biodegradable-semillera-00.jpg',
		cantidad: 0,
		precioUsd: Math.round(19 * 1.3)
	  },
	  {
		id: 1,
		nombre: 'Almaciguera',
		medidas: '4,5 x 4,5 x 5 cm (h)',
		presentacion: 'Pack x600u.',
		volumenCc: 62,
		unidadesPorPack: 600,
		imagen: 'assets/images/producto-maceta-biodegradable-amaciguera-00.jpg',
		cantidad: 0,
		precioUsd: Math.round(48 * 1.3)
	  },
	  {
		id: 2,
		nombre: 'Olivo',
		medidas: '6 cm (d) x 7 cm (h)',
		presentacion: 'Pack x500u.',
		volumenCc: 140,
		unidadesPorPack: 500,
		imagen: 'assets/images/producto-maceta-biodegradable-olivo-00.jpg',
		cantidad: 0,
		precioUsd: Math.round(47 * 1.3)
	  },
	  {
		id: 3,
		nombre: 'Floral',
		medidas: '8 cm (d) x 9 cm (h)',
		presentacion: 'Pack x300u.',
		volumenCc: 320,
		unidadesPorPack: 300,
		imagen: 'assets/images/producto-maceta-biodegradable-floral-00.jpg',
		cantidad: 0,
		precioUsd: Math.round(58 * 1.3)
	  },
	  {
		id: 4,
		nombre: 'Floral 11',
		medidas: '10,5 cm (d) x 11 cm (h)',
		presentacion: 'Pack x100u.',
		volumenCc: 860,
		unidadesPorPack: 100,
		imagen: 'assets/images/producto-maceta-biodegradable-floral11-00.jpg',
		cantidad: 0,
		precioUsd: Math.round(70 * 1.3)
	  }
	];


  private items: Producto[] = [];

  private carrito$ = new BehaviorSubject<Producto[]>([]);
  private dolar$ = new BehaviorSubject<number>(0);
  private productos$ = new BehaviorSubject<Producto[]>([]);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const saved = localStorage.getItem('carrito');
      if (saved) this.items = JSON.parse(saved);
    }

    this.syncCantidadesEnCatalogo();
    this.emitir();

    if (this.isBrowser) {
      this.obtenerDolarBNA();
    }
  }

  private guardar() {
    if (this.isBrowser) {
      localStorage.setItem('carrito', JSON.stringify(this.items));
    }
  }

  private emitir() {
    this.carrito$.next([...this.items]);
    this.productos$.next(this.getProductos());
    this.dolar$.next(this.dolarVenta);
  }

  private syncCantidadesEnCatalogo() {
    this._productos.forEach(p => p.cantidad = 0);
    this.items.forEach(ci => {
      const cat = this._productos.find(p => p.id === ci.id);
      if (cat) cat.cantidad = ci.cantidad;
    });
  }

  getCarrito$() { return this.carrito$.asObservable(); }
  getDolarVenta$() { return this.dolar$.asObservable(); }
  getProductos$() { return this.productos$.asObservable(); }

  getDolarVenta() { return this.dolarVenta; }
  getProductos() { return this._productos.map(p => ({ ...p })); }
  getCarrito() { return [...this.items]; }
  
  getProductoPorId(id: number) {
    return this._productos.find(p => p.id === id);
  }

  async obtenerDolarBNA() {
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/oficial');
      const data = await res.json();
      this.dolarVenta = data?.venta ?? 0;
    } catch (e) {
      console.error('Error al obtener el dólar oficial:', e);
    } finally {
      this.emitir();
    }
  }

  agregarProducto(producto: Producto) {
    this.setCantidad(producto.id, (this.getCantidadActual(producto.id) + producto.cantidad));
  }

  setCantidad(id: number, cantidad: number) {
    const cat = this._productos.find(p => p.id === id);
    if (cat) cat.cantidad = Math.max(0, cantidad);

    const idx = this.items.findIndex(p => p.id === id);
    if (cantidad <= 0) {
      if (idx >= 0) this.items.splice(idx, 1);
    } else {
      if (idx >= 0) {
        this.items[idx].cantidad = cantidad;
      } else {
        const base = this._productos.find(p => p.id === id);
        if (base) this.items.push({ ...base, cantidad });
      }
    }

    this.guardar();
    this.emitir();
  }

  actualizarCantidad(id: number, cantidad: number) {
    this.setCantidad(id, cantidad);
  }

  eliminarProducto(id: number) {
    this.setCantidad(id, 0);
  }

  vaciarCarrito() {
    this.items = [];
    this.syncCantidadesEnCatalogo();
    this.guardar();
    this.emitir();
  }

  calcularVolumenTotal() {
    return this.items.reduce((acc, p) => acc + (p.volumenCc * p.unidadesPorPack * p.cantidad), 0);
  }

  calcularTotalUSD() {
    return this.items.reduce((acc, p) => acc + (p.precioUsd * p.cantidad), 0);
  }

  calcularTotalPesos() {
    return this.items.reduce((acc, p) => acc + (p.precioUsd * this.dolarVenta * p.cantidad), 0);
  }

  private getCantidadActual(id: number) {
    const inCart = this.items.find(p => p.id === id);
    return inCart ? inCart.cantidad : 0;
  }
}
