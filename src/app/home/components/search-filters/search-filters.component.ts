import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent {
  @Input() categories: string[] = [];
  @Input() searchTerm: string = '';
  @Input() selectedCategory: string = '';

  @Output() search = new EventEmitter<void>();
  @Output() categoryChange = new EventEmitter<string>();

  onSearch(): void {
    this.search.emit();
  }

  onCategoryChange(): void {
    this.categoryChange.emit(this.selectedCategory);
  }
}
