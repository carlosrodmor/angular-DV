import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailIngredientsListComponent } from './cocktail-ingredients-list.component';

describe('CocktailIngredientsListComponent', () => {
  let component: CocktailIngredientsListComponent;
  let fixture: ComponentFixture<CocktailIngredientsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailIngredientsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailIngredientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
