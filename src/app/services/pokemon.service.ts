import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  Pokemon,
  PokemonDetailResponse,
  PokemonListResponse,
} from '../models/pokemon.model';

/** Resultado de una página: los Pokémon ya listos para la UI + el total para paginar. */
export interface PokemonPage {
  pokemons: Pokemon[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  /**
   * Trae una página de Pokémon YA con el detalle completo de cada uno.
   *
   * Flujo RxJS (un único pipe, sin suscripciones anidadas):
   * 1. GET /pokemon?limit&offset  -> { results: [{name, url}, ...] }
   * 2. switchMap: por cada item de "results", disparamos un GET a su "url"
   *    de detalle. Como son N peticiones en paralelo, las agrupamos con
   *    forkJoin para esperar a que TODAS respondan antes de continuar.
   * 3. map: aplanamos cada PokemonDetailResponse (forma cruda de la API)
   *    al modelo Pokemon (forma que usa la plantilla).
   * 4. catchError: si algo falla en cualquier punto de la cadena,
   *    devolvemos un error controlado para que el componente lo muestre.
   */
  getPokemonPage(offset: number, limit: number): Observable<PokemonPage> {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);

    return this.http.get<PokemonListResponse>(this.baseUrl, { params }).pipe(
      switchMap((listResponse) => {
        if (listResponse.results.length === 0) {
          return of({ total: listResponse.count, details: [] as PokemonDetailResponse[] });
        }

        const detailRequests = listResponse.results.map((item) =>
          this.http.get<PokemonDetailResponse>(item.url)
        );

        // forkJoin espera a que TODAS las peticiones de detalle terminen
        // y emite un único array con los resultados, en el mismo orden.
        return forkJoin(detailRequests).pipe(
          map((details) => ({ total: listResponse.count, details }))
        );
      }),
      map(({ total, details }) => ({
        total,
        pokemons: details.map((detail) => this.toPokemon(detail)),
      })),
      catchError((error) => {
        console.error('Error consultando PokeAPI:', error);
        // Relanzamos un error "legible" en vez de una página vacía,
        // para que el componente pueda distinguir "0 resultados" de "falló la petición".
        return throwError(
          () => new Error('No se pudo cargar la lista de Pokémon. Intenta de nuevo.')
        );
      })
    );
  }

  /** Convierte la respuesta cruda de detalle en el modelo que consume la UI. */
  private toPokemon(detail: PokemonDetailResponse): Pokemon {
    const artwork = detail.sprites.other?.['official-artwork']?.front_default;
    return {
      id: detail.id,
      name: detail.name,
      imageUrl: artwork ?? detail.sprites.front_default ?? '',
      types: detail.types.map((t) => t.type.name),
      height: detail.height,
      weight: detail.weight,
      baseExperience: detail.base_experience,
      abilities: detail.abilities.map((a) => a.ability.name),
    };
  }
}
