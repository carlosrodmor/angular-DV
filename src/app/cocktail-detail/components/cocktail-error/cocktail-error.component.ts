import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cocktail-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocktail-error.component.html',
  styleUrl: './cocktail-error.component.scss',
})
export class CocktailErrorComponent {
  @Input() errorMessage: string = '';
}
