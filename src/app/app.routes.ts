import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CocktailDetailComponent } from './cocktail-detail/cocktail-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cocktail/:id', component: CocktailDetailComponent },
  { path: '**', redirectTo: '' },
];
