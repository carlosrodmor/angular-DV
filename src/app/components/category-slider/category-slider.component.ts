import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cocktail } from '../../models/cocktail';

@Component({
  selector: 'app-category-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-slider.component.html',
  styleUrl: './category-slider.component.scss',
})
export class CategorySliderComponent {
  @Input() cocktails: Cocktail[] = [];
  @Input() category: string = '';
  @Input() loading: boolean = false;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() selectCocktail = new EventEmitter<string>();

  currentIndex: number = 0;

  nextSlide(): void {
    if (this.cocktails.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.cocktails.length;
  }

  prevSlide(): void {
    if (this.cocktails.length === 0) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.cocktails.length) % this.cocktails.length;
  }

  onSelectCocktail(): void {
    if (this.cocktails.length === 0) return;
    this.selectCocktail.emit(this.cocktails[this.currentIndex].idDrink);
  }

  onClose(): void {
    this.close.emit();
  }
}
