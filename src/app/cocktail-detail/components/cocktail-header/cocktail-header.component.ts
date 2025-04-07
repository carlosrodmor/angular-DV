import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cocktail-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocktail-header.component.html',
  styleUrl: './cocktail-header.component.scss',
})
export class CocktailHeaderComponent {
  @Output() back = new EventEmitter<void>();
  @Output() loadRandom = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }

  onLoadRandom(): void {
    this.loadRandom.emit();
  }
}
