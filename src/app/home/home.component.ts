import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CocktailService } from '../services/cocktail.service';
import { Cocktail, CocktailsResponse } from '../models/cocktail';
import { IngredientsModalComponent } from '../shared/ingredients-modal/ingredients-modal.component';
import { CategoryModalComponent } from '../shared/category-modal/category-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IngredientsModalComponent,
    CategoryModalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
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

  constructor(
    private cocktailService: CocktailService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar las categorías
    this.loadCategories();

    // Verificar si hay un parámetro random en la URL
    this.route.queryParams.subscribe((params) => {
      if (params['random']) {
        this.loadRandomCocktail();
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

  loadCategories(): void {
    this.cocktailService.getCategories().subscribe(
      (response: any) => {
        if (response && response.drinks) {
          this.categories = response.drinks.map((cat: any) => cat.strCategory);
        }
      },
      (error) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al cargar categorías';
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
      }
    );
  }

  loadRandomCocktail(): void {
    this.cocktailService.getRandom().subscribe(
      (response: any) => {
        if (response && response.drinks && response.drinks.length > 0) {
          const randomCocktail = response.drinks[0];
          this.router.navigate(['/cocktail', randomCocktail.idDrink]);
        }
      },
      (error) => {
        this.error = 'Error al cargar el cóctel aleatorio';
        console.error(error);
      }
    );
  }

  filterByLetter(letter: string): void {
    this.loading = true;
    this.error = '';
    this.filterLetter = letter;

    // Actualizar la URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { letter: letter },
      queryParamsHandling: 'merge',
    });

    this.cocktailService.searchByFirstLetter(letter).subscribe(
      (response: CocktailsResponse) => {
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
      (error) => {
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
      }
    );
  }

  filterByCategory(category: string): void {
    this.loading = true;
    this.error = '';
    this.selectedCategoryFilter = category;

    // Actualizar la URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.cocktailService.filterByCategory(category).subscribe(
      (response: CocktailsResponse) => {
        this.loading = false;
        if (response && response.drinks) {
          // Limitar a 12 cócteles máximo para evitar demasiadas peticiones
          const cocktailsToFetch = response.drinks.slice(0, 12);

          // Para cada cóctel obtenido por categoría, necesitamos obtener detalles completos
          // pero limitamos a 3 peticiones simultáneas para evitar límites de tasa
          this.fetchCocktailDetails(cocktailsToFetch);
        } else {
          this.cocktails = [];
          this.alcoholicCount = 0;
          this.nonAlcoholicCount = 0;
          this.error = `No se encontraron cócteles en la categoría "${category}"`;
        }
      },
      error => {
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
      }
    );
  }

  // Método para obtener detalles de cócteles por lotes para evitar límites de tasa
  fetchCocktailDetails(drinks: any[]): void {
    // Procesar por lotes de 3 cócteles a la vez
    const batchSize = 3;
    const totalBatches = Math.ceil(drinks.length / batchSize);
    const cocktailDetails: Cocktail[] = [];

    // Función para procesar un lote
    const processBatch = (batchIndex: number) => {
      if (batchIndex >= totalBatches) {
        // Todos los lotes procesados
        this.cocktails = cocktailDetails;
        this.updateAlcoholicCount();
        return;
      }

      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, drinks.length);
      const currentBatch = drinks.slice(start, end);
      let completedInBatch = 0;

      currentBatch.forEach(drink => {
        this.cocktailService.getById(drink.idDrink).subscribe(
          (detailResponse: any) => {
            if (detailResponse && detailResponse.drinks && detailResponse.drinks.length > 0) {
              cocktailDetails.push(detailResponse.drinks[0]);
            }
            completedInBatch++;

            if (completedInBatch === currentBatch.length) {
              // Este lote está completo, procesar el siguiente
              setTimeout(() => processBatch(batchIndex + 1), 300); // Pequeño retardo entre lotes
            }
          },
          error => {
            completedInBatch++;
            console.error('Error fetching cocktail details', error);

            if (completedInBatch === currentBatch.length) {
              // Este lote está completo, procesar el siguiente
              setTimeout(() => processBatch(batchIndex + 1), 300);
            }
          }
        );
      });
    };

    // Iniciar procesamiento con el primer lote
    processBatch(0);
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.filterByLetter(this.filterLetter);
      return;
    }

    this.loading = true;
    this.error = '';

    this.cocktailService.searchByName(this.searchTerm).subscribe(
      (response: CocktailsResponse) => {
        this.loading = false;
        if (response && response.drinks) {
          this.cocktails = response.drinks;
          this.updateAlcoholicCount();
        } else {
          this.cocktails = [];
          this.alcoholicCount = 0;
          this.nonAlcoholicCount = 0;
          this.error = 'No se encontraron cócteles';
        }
      },
      (error) => {
        this.loading = false;
        this.error = 'Error en la búsqueda';
        console.error(error);
        this.cocktails = [];
        this.alcoholicCount = 0;
        this.nonAlcoholicCount = 0;
      }
    );
  }

  updateAlcoholicCount(): void {
    this.alcoholicCount = this.cocktails.filter(
      (c) => c.strAlcoholic === 'Alcoholic'
    ).length;
    this.nonAlcoholicCount = this.cocktails.filter(
      (c) =>
        c.strAlcoholic === 'Non alcoholic' || c.strAlcoholic === 'Non Alcoholic'
    ).length;
  }

  countIngredients(cocktail: Cocktail): number {
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
    this.selectedCategory = category;
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }
}
