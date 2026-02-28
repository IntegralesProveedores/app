import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-brand">
          <span class="brand-mark">●</span> Integrales
        </span>
        <span class="footer-copy">Macetas biodegradables · Argentina</span>
        <nav class="footer-nav">
          <a routerLink="/productos">Productos</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--color-border);
      padding: 24px 48px;
      background: var(--color-bg);
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-brand {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
    }
    .brand-mark { color: var(--color-accent); }
    .footer-copy {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
    }
    .footer-nav {
      display: flex;
      gap: 24px;
    }
    .footer-nav a {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      transition: color 0.2s;
    }
    .footer-nav a:hover { color: var(--color-text); }
    @media (max-width: 768px) {
      .footer { padding: 24px; }
    }
  `]
})
export class FooterComponent {}
