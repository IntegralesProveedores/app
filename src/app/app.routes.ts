import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ProductosComponent } from './components/productos/productos.component';
import { MenorPrecioComponent } from './components/relevamientos/menor-precio/menor-precio.component';
import { TendenciaComponent } from './components/relevamientos/tendencia/tendencia.component';
import { MasVendidosComponent } from './components/relevamientos/mas-vendidos/mas-vendidos.component';


export const routes: Routes = [
  { path: '', component: ProductosComponent },
	{ path: 'relevamientos/menorprecio', component: MenorPrecioComponent },
  { path: 'relevamientos/tendencia', component: TendenciaComponent },
  { path: 'relevamientos/masvendidos', component: MasVendidosComponent },
  { path: '**', component: ProductosComponent }, // 404. Captura cualquier URL no definida. 
	/*
  { path: '', component: HomeComponent },
	{ path: 'relevamientos', component: RelevamientosComponent },
	{ path: 'productos', component: ProductosComponent },
	{ path: 'products/details/:id', component: ProductDetailsComponent },
	*/

];
