import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyArsPipe } from '../../pipes/currency-ars.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyArsPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  added = false;

  constructor(private cart: CartService) {}

  get mainImage(): string {
    return this.product.images?.[0]?.url ?? '';
  }

  get variant() {
    return this.product.variants?.[0] ?? null;
  }

  get inStock(): boolean {
    return (this.variant?.stock ?? 0) > 0;
  }

  get price(): number {
    return this.variant?.price_ars ?? 0;
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.variant || !this.inStock) return;

    this.cart.add({
      variantId: this.variant.id,
      productId: this.product.id,
      productName: this.product.name,
      slug: this.product.slug,
      sku: this.variant.sku,
      price_ars: this.variant.price_ars,
      quantity: 1,
      imageUrl: this.mainImage,
      stock: this.variant.stock,
      units_per_pack: this.variant.units_per_pack
    });

    this.added = true;
    setTimeout(() => this.added = false, 1800);
  }
}
