import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CocktailService } from '../../../services/cocktail.service';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent implements OnInit {
  @Input() categories: string[] = [];
  @Input() searchTerm: string = '';
  @Input() selectedCategory: string = '';

  @Output() search = new EventEmitter<void>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  apiStatus: boolean | null = null;

  constructor(private cocktailService: CocktailService) {}

  ngOnInit(): void {
    this.checkApiStatus();
  }

  onSearch(): void {
    this.search.emit();
  }

  onCategoryChange(): void {
    this.categoryChange.emit(this.selectedCategory);
  }

  onRefreshData(): void {
    // Indicar al componente padre que debe refrescar los datos
    this.refresh.emit();
    // Verificar el estado de la API
    this.checkApiStatus();
  }

  private checkApiStatus(): void {
    this.cocktailService.checkApiStatus().subscribe((status) => {
      this.apiStatus = status;
    });
  }
}
