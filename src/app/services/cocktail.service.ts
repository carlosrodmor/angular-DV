import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  private apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1';
  private cache: Map<string, any> = new Map();
  private cacheExpiration: Map<string, number> = new Map();
  private cacheDuration = 30 * 60 * 1000; // 30 minutos en milisegundos

  constructor(private http: HttpClient) {}

  // Método para obtener datos con caché
  private getWithCache<T>(
    url: string,
    forceRefresh: boolean = false
  ): Observable<T> {
    const now = Date.now();

    // Si se solicita forzar refresco, eliminar la entrada de caché
    if (forceRefresh) {
      this.cache.delete(url);
      this.cacheExpiration.delete(url);
    }

    // Verificar si tenemos una versión en caché válida
    if (this.cache.has(url) && this.cacheExpiration.get(url)! > now) {
      console.log(`Usando caché para: ${url}`);
      return of(this.cache.get(url) as T);
    }

    // Si no hay caché o expiró, hacer la solicitud
    return this.http.get<T>(url).pipe(
      retry({ count: 2, delay: this.retryStrategy }),
      tap((response) => {
        // Verificar que la respuesta no esté vacía antes de cachear
        if (
          response &&
          (response as any).drinks &&
          (response as any).drinks.length > 0
        ) {
          // Guardar en caché
          this.cache.set(url, response);
          this.cacheExpiration.set(url, now + this.cacheDuration);
        } else {
          console.log(`No se guardó en caché respuesta vacía para: ${url}`);
        }
      }),
      catchError((error) => this.handleError(error, url))
    );
  }

  // Estrategia de retardo exponencial para reintentos
  private retryStrategy(error: any, retryCount: number): Observable<number> {
    if (error.status === 429) {
      // Para errores 429, usar un retroceso exponencial
      const retryDelay = Math.pow(2, retryCount) * 1000;
      console.log(
        `Reintentando después de ${retryDelay}ms debido a límite de tasa`
      );
      return of(retryDelay);
    }
    // Para otros errores, no reintentar
    return throwError(() => error);
  }

  // Manejador de errores global
  private handleError(error: HttpErrorResponse, url: string): Observable<any> {
    // Intentar usar caché vencida si está disponible en caso de error
    if (this.cache.has(url)) {
      console.log(`Usando caché vencida para: ${url} debido a error`);
      return of(this.cache.get(url));
    }

    let errorMessage = 'Error desconocido';
    if (error.status === 429) {
      errorMessage =
        'Se ha alcanzado el límite de solicitudes a la API. Por favor, inténtalo más tarde.';
    } else if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Búsqueda de cóctel por nombre
  searchByName(name: string, forceRefresh: boolean = false): Observable<any> {
    return this.getWithCache(
      `${this.apiUrl}/search.php?s=${name}`,
      forceRefresh
    );
  }

  // Listar todos los cócteles por primera letra
  searchByFirstLetter(
    letter: string,
    forceRefresh: boolean = false
  ): Observable<any> {
    return this.getWithCache(
      `${this.apiUrl}/search.php?f=${letter}`,
      forceRefresh
    );
  }

  // Búsqueda de cóctel por ID
  getById(id: string, forceRefresh: boolean = false): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/lookup.php?i=${id}`, forceRefresh);
  }

  // Cóctel aleatorio
  getRandom(): Observable<any> {
    // No cacheamos los aleatorios
    return this.http
      .get(`${this.apiUrl}/random.php`)
      .pipe(catchError((error) => this.handleError(error, 'random')));
  }

  // Filtrar por ingrediente
  filterByIngredient(
    ingredient: string,
    forceRefresh: boolean = false
  ): Observable<any> {
    return this.getWithCache(
      `${this.apiUrl}/filter.php?i=${ingredient}`,
      forceRefresh
    );
  }

  // Filtrar por alcohólico o no
  filterByAlcoholic(
    alcoholic: string,
    forceRefresh: boolean = false
  ): Observable<any> {
    return this.getWithCache(
      `${this.apiUrl}/filter.php?a=${alcoholic}`,
      forceRefresh
    );
  }

  // Filtrar por categoría
  filterByCategory(
    category: string,
    forceRefresh: boolean = false
  ): Observable<any> {
    return this.getWithCache(
      `${this.apiUrl}/filter.php?c=${category}`,
      forceRefresh
    );
  }

  // Listar categorías
  getCategories(forceRefresh: boolean = false): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/list.php?c=list`, forceRefresh);
  }

  // Listar ingredientes
  getIngredients(forceRefresh: boolean = false): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/list.php?i=list`, forceRefresh);
  }

  // Listar tipos (alcohólico o no)
  getAlcoholicFilter(forceRefresh: boolean = false): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/list.php?a=list`, forceRefresh);
  }

  // Obtener URL de imagen de ingrediente
  getIngredientImageUrl(ingredient: string): string {
    return `https://www.thecocktaildb.com/images/ingredients/${ingredient}-Small.png`;
  }

  // Limpiar caché
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiration.clear();
    console.log('Caché limpiada');
  }

  // Limpiar caché específica para una categoría
  clearCategoryCache(category: string): void {
    const url = `${this.apiUrl}/filter.php?c=${category}`;
    this.cache.delete(url);
    this.cacheExpiration.delete(url);
    console.log(`Caché limpiada para categoría: ${category}`);
  }

  // Verificar estado de la API
  checkApiStatus(): Observable<boolean> {
    // Intentamos obtener la lista de categorías como una verificación simple
    return this.http.get<any>(`${this.apiUrl}/list.php?c=list`).pipe(
      map((response) => {
        return !!(response && response.drinks && response.drinks.length > 0);
      }),
      catchError(() => {
        console.error('La API no está respondiendo correctamente');
        return of(false);
      })
    );
  }
}
