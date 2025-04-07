import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cocktail } from '../../../models/cocktail';

@Component({
  selector: 'app-cocktail-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocktail-info.component.html',
  styleUrl: './cocktail-info.component.scss',
})
export class CocktailInfoComponent {
  @Input() cocktail: Cocktail | null = null;
  @Output() showIngredientsModal = new EventEmitter<void>();
  @Output() loadCategory = new EventEmitter<void>();

  onShowIngredients(): void {
    this.showIngredientsModal.emit();
  }

  onLoadCategory(): void {
    this.loadCategory.emit();
  }
}
