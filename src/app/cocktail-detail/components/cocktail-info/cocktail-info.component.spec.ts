import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailInfoComponent } from './cocktail-info.component';

describe('CocktailInfoComponent', () => {
  let component: CocktailInfoComponent;
  let fixture: ComponentFixture<CocktailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
