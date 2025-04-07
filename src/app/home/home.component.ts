import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CocktailService } from '../services/cocktail.service';
import { Cocktail, CocktailsResponse } from '../models/cocktail';
import { IngredientsModalComponent } from '../shared/ingredients-modal/ingredients-modal.component';
import { CategoryModalComponent } from '../shared/category-modal/category-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

// Importación simplificada de componentes
import {
  HomeHeaderComponent,
  SearchFiltersComponent,
  LetterFiltersComponent,
  CocktailTableComponent,
  EmptyStateComponent,
  LoadingStateComponent,
  ErrorStateComponent,
} from './components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IngredientsModalComponent,
    CategoryModalComponent,
    HomeHeaderComponent,
    SearchFiltersComponent,
    LetterFiltersComponent,
    CocktailTableComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  cocktails: Cocktail[] = [];
  filterLetter: string = '';
  letters: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  loading: boolean = false;
  error: string = '';

  alcoholicCount: number = 0;
  nonAlcoholicCount: number = 0;

  selectedCocktailIngredients: any = null;
  showIngredientsModal: boolean = false;

  selectedCategory: string = '';
  showCategoryModal: boolean = false;

  categories: string[] = [];
  selectedCategoryFilter: string = '';

  searchTerm: string = '';

  private destroy$ = new Subject<void>();

  private cocktailService = inject(CocktailService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    // Cargar las categorías
    this.loadCategories();

    // Verificar si hay parámetros en la URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['random']) {
          this.loadRandomCocktail();
        } else if (params['search']) {
          this.searchTerm = params['search'];
          this.search();
        } else if (params['letter']) {
          this.filterLetter = params['letter'];
          this.filterByLetter(this.filterLetter);
        } else if (params['category']) {
          this.selectedCategoryFilter = params['category'];
          this.filterByCategory(this.selectedCategoryFilter);
        } else {
          // Por defecto cargamos la letra 'a'
          this.filterLetter = 'a';
          this.filterByLetter('a');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.cocktailService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.drinks) {
            this.categories = response.drinks.map(
              (cat: any) => cat.strCategory
            );
          }
        },
        error: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Error al cargar categorías';
          console.error('Error loading categories', error);
          // Mostrar error en la interfaz
          this.error = errorMessage;
          // Intentar cargar desde una lista predefinida si hay error
          this.categories = [
            'Ordinary Drink',
            'Cocktail',
            'Milk / Float / Shake',
            'Other/Unknown',
            'Cocoa',
            'Shot',
            'Coffee / Tea',
            'Homemade Liqueur',
            'Punch / Party Drink',
            'Beer',
            'Soft Drink / Soda',
          ];
        },
      });
  }

  loadRandomCocktail(): void {
    this.cocktailService
      .getRandom()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.drinks && response.drinks.length > 0) {
            const randomCocktail = response.drinks[0];
            this.router.navigate(['/cocktail', randomCocktail.idDrink]);
          }
        },
        error: (error) => {
          this.error = 'Error al cargar el cóctel aleatorio';
          console.error(error);
        },
      });
  }

  filterByLetter(letter: string): void {
    this.loading = true;
    this.error = '';
    this.filterLetter = letter;
    // Limpiar el filtro de categoría cuando se selecciona una letra
    this.selectedCategoryFilter = '';

    // Actualizar la URL sin recargar la página - solo mantener parámetro de letra
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { letter: letter }, // Solo mantener el parámetro de letra
      replaceUrl: true,
    });

    this.cocktailService
      .searchByFirstLetter(letter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CocktailsResponse) => {
          this.loading = false;
          if (response && response.drinks) {
            this.cocktails = response.drinks;
            this.updateAlcoholicCount();
          } else {
            this.cocktails = [];
            this.alcoholicCount = 0;
            this.nonAlcoholicCount = 0;
            this.error = `No se encontraron cócteles que comiencen con la letra "${letter}"`;
          }
        },
        error: (error) => {
          this.loading = false;
          this.cocktails = [];
          this.alcoholicCount = 0;
          this.nonAlcoholicCount = 0;

          if (error instanceof Error) {
            this.error = error.message;
          } else {
            this.error = 'Error al cargar los cócteles';
          }

          console.error('Error al filtrar por letra:', error);
        },
      });
  }

  filterByCategory(category: string): void {
    this.loading = true;
    this.error = '';
    this.selectedCategoryFilter = category;

    // Si se selecciona "Todas las categorías", volver a cargar por letra
    if (!category) {
      this.filterByLetter(this.filterLetter);
      return;
    }

    // Actualizar la URL sin recargar la página - evitar mezclar parámetros
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category }, // Solo mantener el parámetro de categoría
      replaceUrl: true,
    });

    this.cocktailService
      .filterByCategory(category)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CocktailsResponse) => {
          this.loading = false;
          if (response && response.drinks) {
            // Limitamos a 10 cócteles para evitar muchas peticiones
            const cocktailsToFetch = response.drinks.slice(0, 10);
            this.cocktails = cocktailsToFetch;

            // Pre-poblamos datos esenciales para mejorar la experiencia de usuario
            this.cocktails.forEach((cocktail) => {
              // Aseguramos que todos los cócteles tengan su categoría correcta
              cocktail.strCategory = category;
              // Preseleccionar valores por defecto para evitar errores visuales
              if (!cocktail.strAlcoholic) {
                cocktail.strAlcoholic = 'Alcoholic'; // Valor por defecto
              }
            });

            this.updateAlcoholicCount();
          } else {
            this.cocktails = [];
            this.alcoholicCount = 0;
            this.nonAlcoholicCount = 0;
            this.error = `No se encontraron cócteles en la categoría "${category}"`;
          }
        },
        error: (error) => {
          this.loading = false;
          this.cocktails = [];
          this.alcoholicCount = 0;
          this.nonAlcoholicCount = 0;

          if (error instanceof Error) {
            this.error = error.message;
          } else {
            this.error = 'Error al filtrar por categoría';
          }

          console.error('Error al filtrar por categoría:', error);
        },
      });
  }

  search(term?: string): void {
    // Si se proporciona un término de búsqueda desde el componente hijo, actualizarlo
    if (term !== undefined) {
      this.searchTerm = term;
    }

    if (!this.searchTerm.trim()) {
      this.filterByLetter(this.filterLetter);
      return;
    }

    this.loading = true;
    this.error = '';

    // Limpiar filtros anteriores
    this.selectedCategoryFilter = '';
    this.filterLetter = '';

    // Actualizar la URL para reflejar la búsqueda
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: this.searchTerm },
      replaceUrl: true,
    });

    this.cocktailService
      .searchByName(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CocktailsResponse) => {
          this.loading = false;
          if (response && response.drinks) {
            this.cocktails = response.drinks;
            this.updateAlcoholicCount();
          } else {
            this.cocktails = [];
            this.alcoholicCount = 0;
            this.nonAlcoholicCount = 0;
            this.error = `No se encontraron cócteles para: "${this.searchTerm}"`;
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error en la búsqueda';
          console.error(error);
          this.cocktails = [];
          this.alcoholicCount = 0;
          this.nonAlcoholicCount = 0;
        },
      });
  }

  updateAlcoholicCount(): void {
    this.alcoholicCount = this.cocktails.filter(
      (c) => c.strAlcoholic === 'Alcoholic'
    ).length;
    this.nonAlcoholicCount = this.cocktails.filter(
      (c) =>
        c.strAlcoholic === 'Non alcoholic' || c.strAlcoholic === 'Non Alcoholic'
    ).length;

    // Si no hay datos de tipo alcohólico, estimar basado en categoría
    if (
      this.alcoholicCount === 0 &&
      this.nonAlcoholicCount === 0 &&
      this.cocktails.length > 0
    ) {
      // Categorías que típicamente son no alcohólicas
      const nonAlcoholicCategories = [
        'Soft Drink / Soda',
        'Coffee / Tea',
        'Cocoa',
        'Milk / Float / Shake',
      ];

      // Estimar basado en categoría
      this.cocktails.forEach((cocktail) => {
        if (
          cocktail.strCategory &&
          nonAlcoholicCategories.includes(cocktail.strCategory)
        ) {
          this.nonAlcoholicCount++;
          // Actualizar el cóctel para visualización correcta
          cocktail.strAlcoholic = 'Non Alcoholic';
        } else {
          this.alcoholicCount++;
          // Actualizar el cóctel para visualización correcta
          cocktail.strAlcoholic = 'Alcoholic';
        }
      });
    }
  }

  countIngredients(cocktail: Cocktail): number {
    // Verificar si tenemos información de ingredientes
    if (cocktail.strIngredient1 === undefined) {
      // Si no tenemos información, devolver un valor predeterminado
      // Que sugiera que hay que hacer clic para ver los detalles
      return 0;
    }

    let count = 0;
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}` as keyof Cocktail];
      if (ingredient) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  showIngredients(cocktail: Cocktail): void {
    // Verificar si tenemos la información de ingredientes
    const hasIngredientInfo = cocktail.strIngredient1 !== undefined;

    if (!hasIngredientInfo) {
      // Si no tenemos información de ingredientes, cargar los detalles completos
      this.loading = true;
      this.cocktailService.getById(cocktail.idDrink).subscribe(
        (response: any) => {
          this.loading = false;
          if (response && response.drinks && response.drinks.length > 0) {
            const detailedCocktail = response.drinks[0];
            this.displayIngredients(detailedCocktail);
          } else {
            this.error = 'No se pudieron cargar los detalles del cóctel';
          }
        },
        (error) => {
          this.loading = false;
          this.error = 'Error al cargar los detalles del cóctel';
          console.error(error);
        }
      );
    } else {
      // Si ya tenemos la información, mostrar los ingredientes directamente
      this.displayIngredients(cocktail);
    }
  }

  displayIngredients(cocktail: Cocktail): void {
    this.selectedCocktailIngredients = {
      name: cocktail.strDrink,
      ingredients: [],
    };

    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}` as keyof Cocktail];
      const measure = cocktail[`strMeasure${i}` as keyof Cocktail];

      if (ingredient) {
        this.selectedCocktailIngredients.ingredients.push({
          name: ingredient,
          measure: measure || 'Al gusto',
          imageUrl: this.cocktailService.getIngredientImageUrl(
            ingredient as string
          ),
        });
      } else {
        break;
      }
    }

    this.showIngredientsModal = true;
  }

  closeIngredientsModal(): void {
    this.showIngredientsModal = false;
  }

  showCategory(category: string): void {
    if (!category) {
      this.error = 'Categoría no disponible';
      return;
    }

    this.selectedCategory = category;
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  /**
   * Refresca los datos actuales forzando una solicitud a la API
   * Útil cuando el filtro de categorías no funciona correctamente
   */
  refreshData(): void {
    this.error = '';
    this.loading = true;

    // Mostrar un mensaje temporal
    const tempMessage = 'Actualizando datos...';
    this.error = tempMessage;

    // Limpiar caché
    this.cocktailService.clearCache();

    setTimeout(() => {
      // Si hay una categoría seleccionada, actualizar esa categoría
      if (this.selectedCategoryFilter) {
        this.cocktailService
          .filterByCategory(this.selectedCategoryFilter, true) // Forzar refresco
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: CocktailsResponse) => {
              this.loading = false;
              // Limpiar el mensaje temporal solo si no ha cambiado
              if (this.error === tempMessage) {
                this.error = '';
              }

              if (response && response.drinks) {
                // Limitamos a 10 cócteles para evitar muchas peticiones
                const cocktailsToFetch = response.drinks.slice(0, 10);
                this.cocktails = cocktailsToFetch;

                // Pre-poblamos datos esenciales
                this.cocktails.forEach((cocktail) => {
                  cocktail.strCategory = this.selectedCategoryFilter;
                  if (!cocktail.strAlcoholic) {
                    cocktail.strAlcoholic = 'Alcoholic';
                  }
                });

                this.updateAlcoholicCount();
              } else {
                this.cocktails = [];
                this.alcoholicCount = 0;
                this.nonAlcoholicCount = 0;
                this.error = `No se encontraron cócteles en la categoría "${this.selectedCategoryFilter}"`;
              }
            },
            error: (error) => {
              this.loading = false;
              this.cocktails = [];
              this.alcoholicCount = 0;
              this.nonAlcoholicCount = 0;

              if (error instanceof Error) {
                this.error = error.message;
              } else {
                this.error = 'Error al refrescar los datos';
              }

              console.error('Error al refrescar datos:', error);
            },
          });
      } else if (this.filterLetter) {
        // Si no hay categoría, pero hay una letra seleccionada, refrescar por letra
        this.filterByLetter(this.filterLetter);
      } else {
        // Si no hay categoría ni letra, cargar por defecto
        this.filterLetter = 'a';
        this.filterByLetter('a');
      }
    }, 500); // Pequeño retraso para mostrar el mensaje
  }
}
