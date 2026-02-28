import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductoListaComponent } from './components/catalogo/producto-lista/producto-lista.component';
import { ProductoDetalleComponent } from './components/catalogo/producto-detalle/producto-detalle.component';
import { CarritoComponent } from './components/catalogo/carrito/carrito.component';
import { BannerComponent } from './components/banner/banner.component';

/*
import { ProductosComponent } from './components/productos/productos.component';
import { MenorPrecioComponent } from './components/relevamientos/menor-precio/menor-precio.component';
import { TendenciaComponent } from './components/relevamientos/tendencia/tendencia.component';
import { MasVendidosComponent } from './components/relevamientos/mas-vendidos/mas-vendidos.component';
*/

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'catalogo', component: ProductoListaComponent },
	{ path: 'producto/:id', component: ProductoDetalleComponent },
	{ path: 'carrito', component: CarritoComponent },
	
	{ path: 'banner', component: BannerComponent },
	
	{ path: '**', redirectTo: '' }
  
  	/*
	{ path: '', component: HomeComponent },
	{ path: 'productos', component: ProductosComponent },
	{ path: 'products/details/:id', component: ProductDetailsComponent },
	{ path: 'relevamientos/menorprecio', component: MenorPrecioComponent },
	{ path: 'relevamientos/tendencia', component: TendenciaComponent },
	{ path: 'relevamientos/masvendidos', component: MasVendidosComponent },
	*/
];


