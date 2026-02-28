import { Component, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements AfterViewInit {
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    this.setupQuantityButtons();
  }

  setupQuantityButtons(): void {
    const buttons = this.document.querySelectorAll<HTMLButtonElement>('.qty-btn');

    buttons.forEach((button) => {
      this.renderer.listen(button, 'click', () => {
        const action = button.dataset['qty'];
        const targetId = button.dataset['target'];
        if (!action || !targetId) return;

        const input = this.document.getElementById(targetId) as HTMLInputElement | null;
        if (!input) return;

        let currentValue = parseInt(input.value, 10);
        if (isNaN(currentValue)) currentValue = 0;

        if (action === 'increment') {
          currentValue++;
        } else if (action === 'decrement' && currentValue > 0) {
          currentValue--;
        }

        input.value = currentValue.toString();
      });
    });
  }


}
