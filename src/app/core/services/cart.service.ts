import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

const CART_KEY = 'cart_items';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>(this.loadFromStorage());

  readonly cartItems = this.items.asReadonly();

  readonly itemCount = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.price_ars * i.quantity, 0)
  );

  readonly isEmpty = computed(() => this.items().length === 0);

  add(item: CartItem): void {
    const current = this.items();
    const existing = current.find(i => i.variantId === item.variantId);

    if (existing) {
      const newQty = existing.quantity + item.quantity;
      if (newQty > existing.stock) return;
      this.items.set(current.map(i =>
        i.variantId === item.variantId ? { ...i, quantity: newQty } : i
      ));
    } else {
      this.items.set([...current, item]);
    }
    this.saveToStorage();
  }

  remove(variantId: string): void {
    this.items.set(this.items().filter(i => i.variantId !== variantId));
    this.saveToStorage();
  }

  updateQuantity(variantId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(variantId);
      return;
    }
    this.items.set(this.items().map(i =>
      i.variantId === variantId ? { ...i, quantity } : i
    ));
    this.saveToStorage();
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem(CART_KEY);
  }

  private saveToStorage(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}