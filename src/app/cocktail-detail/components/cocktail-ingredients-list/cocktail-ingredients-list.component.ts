import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ingredient } from '../../../models/cocktail';

@Component({
  selector: 'app-cocktail-ingredients-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocktail-ingredients-list.component.html',
  styleUrl: './cocktail-ingredients-list.component.scss',
})
export class CocktailIngredientsListComponent {
  @Input() ingredients: Ingredient[] = [];
}
