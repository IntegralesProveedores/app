import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a class="cart-icon" routerLink="/carrito">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <span class="cart-badge" *ngIf="cart.itemCount() > 0">
        {{ cart.itemCount() }}
      </span>
    </a>
  `,
  styles: [`
    .cart-icon {
      position: relative;
      display: flex;
      align-items: center;
      color: var(--color-text);
      text-decoration: none;
      padding: 8px;
      transition: color 0.2s;
    }
    .cart-icon:hover { color: var(--color-accent); }
    .cart-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 18px;
      height: 18px;
      background: var(--color-accent);
      color: var(--color-bg);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  `]
})
export class CartIconComponent {
  constructor(public cart: CartService) {}
}
