import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Cocktail } from '../../../models/cocktail';

@Component({
  selector: 'app-cocktail-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cocktail-table.component.html',
  styleUrls: ['./cocktail-table.component.scss'],
})
export class CocktailTableComponent {
  @Input() cocktails: Cocktail[] = [];
  @Input() alcoholicCount: number = 0;
  @Input() nonAlcoholicCount: number = 0;

  @Output() showIngredients = new EventEmitter<Cocktail>();
  @Output() showCategory = new EventEmitter<string>();

  countIngredients(cocktail: Cocktail): number {
    let count = 0;

    // Contamos los ingredientes no nulos
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}` as keyof Cocktail];
      if (ingredient) {
        count++;
      }
    }

    return count;
  }

  onIngredientsClick(cocktail: Cocktail): void {
    this.showIngredients.emit(cocktail);
  }

  onCategoryClick(category: string): void {
    if (category) {
      this.showCategory.emit(category);
    }
  }
}
