import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailLoadingComponent } from './cocktail-loading.component';

describe('CocktailLoadingComponent', () => {
  let component: CocktailLoadingComponent;
  let fixture: ComponentFixture<CocktailLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
