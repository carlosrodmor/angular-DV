import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailErrorComponent } from './cocktail-error.component';

describe('CocktailErrorComponent', () => {
  let component: CocktailErrorComponent;
  let fixture: ComponentFixture<CocktailErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
