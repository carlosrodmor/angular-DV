import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailInstructionsComponent } from './cocktail-instructions.component';

describe('CocktailInstructionsComponent', () => {
  let component: CocktailInstructionsComponent;
  let fixture: ComponentFixture<CocktailInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailInstructionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
