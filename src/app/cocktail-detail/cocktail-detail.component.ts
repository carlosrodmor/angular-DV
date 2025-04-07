import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CocktailService } from '../services/cocktail.service';
import { Cocktail, Ingredient } from '../models/cocktail';
import { IngredientsModalComponent } from '../shared/ingredients-modal/ingredients-modal.component';
import { Subject, takeUntil } from 'rxjs';

// Importaciones de componentes modulares
import { CocktailHeaderComponent } from '../components/cocktail-header/cocktail-header.component';
import { CocktailLoadingComponent } from '../components/cocktail-loading/cocktail-loading.component';
import { CocktailErrorComponent } from '../components/cocktail-error/cocktail-error.component';
import { CocktailInfoComponent } from '../components/cocktail-info/cocktail-info.component';
import { CocktailInstructionsComponent } from '../components/cocktail-instructions/cocktail-instructions.component';
import { CocktailIngredientsListComponent } from '../components/cocktail-ingredients-list/cocktail-ingredients-list.component';
import { CategorySliderComponent } from '../components/category-slider/category-slider.component';

@Component({
  selector: 'app-cocktail-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IngredientsModalComponent,
    CocktailHeaderComponent,
    CocktailLoadingComponent,
    CocktailErrorComponent,
    CocktailInfoComponent,
    CocktailInstructionsComponent,
    CocktailIngredientsListComponent,
    CategorySliderComponent,
  ],
  templateUrl: './cocktail-detail.component.html',
  styleUrl: './cocktail-detail.component.scss',
})
export class CocktailDetailComponent implements OnInit, OnDestroy {
  cocktail: Cocktail | null = null;
  loading: boolean = false;
  error: string = '';
  ingredients: Ingredient[] = [];
  showIngredientsModal: boolean = false;

  // Variables para el cambio de idioma
  currentLanguage: string = 'default';
  availableLanguages = [
    { code: 'default', name: 'Original', flag: '🌎' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'DE', name: 'Alemán', flag: '🇩🇪' },
    { code: 'FR', name: 'Francés', flag: '🇫🇷' },
    { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
  ];

  // Variables para el slider de categoría
  categoryCocktails: Cocktail[] = [];
  loadingCategory: boolean = false;
  showCategorySlider: boolean = false;
  currentSlideIndex: number = 0;

  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cocktailService = inject(CocktailService);

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.loadCocktail(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCocktail(id: string): void {
    this.loading = true;
    this.error = '';

    this.cocktailService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response && response.drinks && response.drinks.length > 0) {
            this.cocktail = response.drinks[0];
            this.extractIngredients();
          } else {
            this.error = 'No se encontró el cóctel';
            this.cocktail = null;
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error al cargar el cóctel';
          console.error(error);
          this.cocktail = null;
        },
      });
  }

  extractIngredients(): void {
    if (!this.cocktail) return;

    this.ingredients = [];

    for (let i = 1; i <= 15; i++) {
      const ingredient = this.cocktail[`strIngredient${i}` as keyof Cocktail];
      const measure = this.cocktail[`strMeasure${i}` as keyof Cocktail];

      if (ingredient) {
        this.ingredients.push({
          name: ingredient as string,
          measure: measure as string | null,
          imageUrl: this.cocktailService.getIngredientImageUrl(
            ingredient as string
          ),
        });
      } else {
        break;
      }
    }
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

  showIngredients(): void {
    this.showIngredientsModal = true;
  }

  closeIngredientsModal(): void {
    this.showIngredientsModal = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Métodos para el cambio de idioma
  changeLanguage(langCode: string): void {
    this.currentLanguage = langCode;
  }

  getInstructions(): string {
    if (!this.cocktail) return '';

    if (this.currentLanguage === 'default') {
      return this.cocktail.strInstructions;
    }

    const instructionsKey =
      `strInstructions${this.currentLanguage}` as keyof Cocktail;
    const translatedInstructions = this.cocktail[instructionsKey] as
      | string
      | null;

    return translatedInstructions || this.cocktail.strInstructions;
  }

  // Métodos para el slider de categoría
  loadCategoryDrinks(): void {
    if (!this.cocktail || !this.cocktail.strCategory) return;

    this.loadingCategory = true;
    this.cocktailService
      .filterByCategory(this.cocktail.strCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loadingCategory = false;
          if (response && response.drinks && response.drinks.length > 0) {
            this.categoryCocktails = response.drinks;
            this.showCategorySlider = true;
            this.currentSlideIndex = 0;
          }
        },
        error: (error) => {
          this.loadingCategory = false;
          console.error('Error al cargar cócteles de la categoría:', error);
        },
      });
  }

  nextSlide(): void {
    if (this.categoryCocktails.length === 0) return;
    this.currentSlideIndex =
      (this.currentSlideIndex + 1) % this.categoryCocktails.length;
  }

  prevSlide(): void {
    if (this.categoryCocktails.length === 0) return;
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.categoryCocktails.length) %
      this.categoryCocktails.length;
  }

  openCocktailDetails(id: string): void {
    this.showCategorySlider = false;
    this.router.navigate(['/cocktail', id]);
  }

  closeCategorySlider(): void {
    this.showCategorySlider = false;
  }
}
