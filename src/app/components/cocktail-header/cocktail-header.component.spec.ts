import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailHeaderComponent } from './cocktail-header.component';

describe('CocktailHeaderComponent', () => {
  let component: CocktailHeaderComponent;
  let fixture: ComponentFixture<CocktailHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
