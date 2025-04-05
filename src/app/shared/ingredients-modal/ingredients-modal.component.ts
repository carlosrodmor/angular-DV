import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ingredient } from '../../models/cocktail';

@Component({
  selector: 'app-ingredients-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingredients-modal.component.html',
  styleUrl: './ingredients-modal.component.scss',
})
export class IngredientsModalComponent {
  @Input() cocktailName: string = '';
  @Input() ingredients: Ingredient[] = [];
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
