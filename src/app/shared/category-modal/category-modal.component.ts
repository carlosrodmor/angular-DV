import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CocktailService } from '../../services/cocktail.service';
import { Cocktail } from '../../models/cocktail';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.scss',
})
export class CategoryModalComponent implements OnInit, OnDestroy {
  @Input() category: string = '';
  @Output() close = new EventEmitter<void>();

  cocktails: Cocktail[] = [];
  loading: boolean = false;
  error: string = '';

  private destroy$ = new Subject<void>();
  private cocktailService = inject(CocktailService);

  ngOnInit(): void {
    this.loadCocktailsByCategory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCocktailsByCategory(): void {
    this.loading = true;
    this.error = '';

    this.cocktailService
      .filterByCategory(this.category)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response && response.drinks) {
            // Limitar a 12 cócteles para el modal
            this.cocktails = response.drinks.slice(0, 12);
          } else {
            this.cocktails = [];
            this.error = 'No se encontraron cócteles en esta categoría';
          }
        },
        error: (error) => {
          this.loading = false;
          this.cocktails = [];

          if (error instanceof HttpErrorResponse && error.status === 429) {
            this.error =
              'Se ha alcanzado el límite de solicitudes a la API. Por favor, inténtalo más tarde.';
          } else if (error instanceof Error) {
            this.error =
              error.message || 'Error al cargar los cócteles de la categoría';
          } else {
            this.error = 'Error al cargar los cócteles de la categoría';
          }

          console.error('Error al cargar cócteles por categoría:', error);
        },
      });
  }

  closeModal(): void {
    this.close.emit();
  }
}
