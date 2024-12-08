import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appTranslateFilter]'
})
export class TranslateFilterDirective implements AfterViewInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.setupFilterMenuListener();
  }

  private setupFilterMenuListener(): void {
    // Listen for click events on the table to handle filter menu display
    this.renderer.listen(this.el.nativeElement, 'click', () => {
      // Delay to ensure the filter menu is fully rendered
      setTimeout(() => this.translateFilterTexts(), 0);
    });
  }

  private translateFilterTexts(): void {
    document.querySelectorAll('.p-column-filter-row-item').forEach(item => {
      switch (item.textContent.trim()) {
        case 'Starts with':
          item.textContent = 'Inizia con';
          break;
        case 'Contains':
          item.textContent = 'Contiene';
          break;
        case 'Not contains':
          item.textContent = 'Non contiene';
          break;
        case 'Ends with':
          item.textContent = 'Finisce con';
          break;
        case 'Equals':
          item.textContent = 'Uguale';
          break;
        case 'Not equals':
          item.textContent = 'Diverso';
          break;
        case 'No Filter':
          item.textContent = 'Nessun filtro';
          break;
      }
    });
  }
}
