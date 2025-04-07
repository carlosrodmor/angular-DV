import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cocktail } from '../../../models/cocktail';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-cocktail-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocktail-instructions.component.html',
  styleUrl: './cocktail-instructions.component.scss',
})
export class CocktailInstructionsComponent implements OnChanges {
  @Input() cocktail: Cocktail | null = null;

  currentLanguage: string = 'default';
  instructions: string = '';

  availableLanguages: Language[] = [
    { code: 'default', name: 'Original', flag: '🌎' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'DE', name: 'Alemán', flag: '🇩🇪' },
    { code: 'FR', name: 'Francés', flag: '🇫🇷' },
    { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cocktail'] && this.cocktail) {
      this.updateInstructions();
    }
  }

  changeLanguage(langCode: string): void {
    this.currentLanguage = langCode;
    this.updateInstructions();
  }

  private updateInstructions(): void {
    if (!this.cocktail) {
      this.instructions = '';
      return;
    }

    if (this.currentLanguage === 'default') {
      this.instructions = this.cocktail.strInstructions;
      return;
    }

    const instructionsKey =
      `strInstructions${this.currentLanguage}` as keyof Cocktail;
    const translatedInstructions = this.cocktail[instructionsKey] as
      | string
      | null;
    this.instructions = translatedInstructions || this.cocktail.strInstructions;
  }
}
