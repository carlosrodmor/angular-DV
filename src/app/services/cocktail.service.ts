import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry, delay, tap } from 'rxjs/operators';

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
  private getWithCache<T>(url: string): Observable<T> {
    const now = Date.now();

    // Verificar si tenemos una versión en caché válida
    if (this.cache.has(url) && this.cacheExpiration.get(url)! > now) {
      console.log(`Usando caché para: ${url}`);
      return of(this.cache.get(url) as T);
    }

    // Si no hay caché o expiró, hacer la solicitud
    return this.http.get<T>(url).pipe(
      retry({ count: 2, delay: this.retryStrategy }),
      tap((response) => {
        // Guardar en caché
        this.cache.set(url, response);
        this.cacheExpiration.set(url, now + this.cacheDuration);
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
  searchByName(name: string): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/search.php?s=${name}`);
  }

  // Listar todos los cócteles por primera letra
  searchByFirstLetter(letter: string): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/search.php?f=${letter}`);
  }

  // Búsqueda de cóctel por ID
  getById(id: string): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/lookup.php?i=${id}`);
  }

  // Cóctel aleatorio
  getRandom(): Observable<any> {
    // No cacheamos los aleatorios
    return this.http
      .get(`${this.apiUrl}/random.php`)
      .pipe(catchError((error) => this.handleError(error, 'random')));
  }

  // Filtrar por ingrediente
  filterByIngredient(ingredient: string): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/filter.php?i=${ingredient}`);
  }

  // Filtrar por alcohólico o no
  filterByAlcoholic(alcoholic: string): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/filter.php?a=${alcoholic}`);
  }

  // Filtrar por categoría
  filterByCategory(category: string): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/filter.php?c=${category}`);
  }

  // Listar categorías
  getCategories(): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/list.php?c=list`);
  }

  // Listar ingredientes
  getIngredients(): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/list.php?i=list`);
  }

  // Listar tipos (alcohólico o no)
  getAlcoholicFilter(): Observable<any> {
    return this.getWithCache(`${this.apiUrl}/list.php?a=list`);
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
}
