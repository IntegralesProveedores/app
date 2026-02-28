import html2canvas from 'html2canvas';
import { Component, ViewChild, ViewContainerRef, ComponentRef, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 
import { Banner01Component } from './banner-01/banner-01.component';
import { Banner02Component } from './banner-02/banner-02.component';
import { Banner03Component } from './banner-03/banner-03.component';
import { CarritoService, Producto } from '../../services/carrito.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent {
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  formatoSeleccionado: 'cuadrado' | 'vertical' | 'historia' = 'cuadrado';


@ViewChild('contenedorBanner', { read: ViewContainerRef, static: true })
contenedorBanner!: ViewContainerRef;

@ViewChild('exportableBanner', { static: true })
exportableBanner!: ElementRef;


  
  

  componenteActual: ComponentRef<any> | null = null;

  constructor(private carrito: CarritoService) {}

  ngOnInit() {
    this.productos = this.carrito.getProductos();
  }

  seleccionarProducto(prod: Producto) {
    this.productoSeleccionado = prod;
    if (this.componenteActual) {
      this.componenteActual.instance.producto = prod;
    }
  }

  cambiarPlantilla(num: number) {
    this.contenedorBanner.clear();
    let componente: any;

    switch (num) {
      case 1:
        componente = Banner01Component;
        break;
      case 2:
        componente = Banner02Component;
        break;
      case 3:
        componente = Banner03Component;
        break;
    }

    if (componente) {
      this.componenteActual = this.contenedorBanner.createComponent(componente);
      if (this.productoSeleccionado) {
        this.componenteActual.instance.producto = this.productoSeleccionado;
      }
    }
  }

	exportarImagen() {
	  const element = this.exportableBanner.nativeElement;

	  // Definir tamaño deseado en píxeles reales
	  let width = 1080;
	  let height = 1080;

	  if (this.formatoSeleccionado === 'vertical') {
		height = 1350;
	  } else if (this.formatoSeleccionado === 'historia') {
		height = 1920;
	  }

	  // Escala del dispositivo (mayor = mejor calidad)
	  const scale = 2;

	  // Establecer tamaño físico del contenedor
	  const originalStyle = element.getAttribute('style');
	  element.style.width = `${width}px`;
	  element.style.height = `${height}px`;

	  html2canvas(element, {
		backgroundColor: null,
		useCORS: true,
		scale,             // Aumenta la resolución del canvas
		width,
		height
	  }).then((canvas) => {
		// Escalar a tamaño final
		const finalCanvas = document.createElement('canvas');
		finalCanvas.width = width;
		finalCanvas.height = height;

		const ctx = finalCanvas.getContext('2d');
		if (ctx) {
		  ctx.drawImage(canvas, 0, 0, width, height);

		  const link = document.createElement('a');
		  link.href = finalCanvas.toDataURL('image/png');
		  link.download = `banner-${this.formatoSeleccionado}.png`;
		  link.click();
		}

		// Restaurar estilo original
		if (originalStyle) {
		  element.setAttribute('style', originalStyle);
		} else {
		  element.removeAttribute('style');
		}
	  });
	}



}
