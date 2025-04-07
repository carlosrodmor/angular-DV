import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-letter-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-filters.component.html',
  styleUrls: ['./letter-filters.component.scss'],
})
export class LetterFiltersComponent {
  @Input() letters: string[] = [];
  @Input() selectedLetter: string = '';

  @Output() letterSelect = new EventEmitter<string>();

  onLetterSelect(letter: string): void {
    this.letterSelect.emit(letter);
  }
}
