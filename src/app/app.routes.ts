import { Routes } from '@angular/router';
import { cartNotEmptyGuard } from './core/guards/cart-not-empty.guard';

import { HomeComponent } from './components/home/home.component';
import { ProductoListaComponent } from './components/catalogo/producto-lista/producto-lista.component';
import { ProductoDetalleComponent } from './components/catalogo/producto-detalle/producto-detalle.component';
import { CarritoComponent } from './components/catalogo/carrito/carrito.component';


export const routes: Routes = [
  
	{ path: '', component: HomeComponent },
	{ path: 'catalogo', component: ProductoListaComponent },
	{ path: 'producto/:id', component: ProductoDetalleComponent },
	{ path: 'carrito', component: CarritoComponent },
  
  



  {
    path: 'productos',
    loadComponent: () =>
      import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'productos/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [cartNotEmptyGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'orden/exito',
    loadComponent: () =>
      import('./features/order-status/success/success.component').then(m => m.SuccessComponent)
  },
  {
    path: 'orden/error',
    loadComponent: () =>
      import('./features/order-status/failure/failure.component').then(m => m.FailureComponent)
  },
  {
    path: 'orden/:id',
    loadComponent: () =>
      import('./features/order-status/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: '**',
    redirectTo: 'productos'
  }
];
