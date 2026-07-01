import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: false,
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
})
export class PokemonListComponent implements OnInit, OnDestroy {
  pokemons: Pokemon[] = [];

  loading = false;
  errorMessage: string | null = null;

  // --- Paginación ---
  readonly pageSize = 12;
  offset = 0;
  total = 0;

  private subscription: Subscription | null = null;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadPage();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadPage(): void {
    this.loading = true;
    this.errorMessage = null;

    this.subscription = this.pokemonService
      .getPokemonPage(this.offset, this.pageSize)
      .subscribe({
        next: (page) => {
          this.pokemons = page.pokemons;
          this.total = page.total;
          this.loading = false;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.pokemons = [];
          this.loading = false;
        },
      });
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }
    this.offset += this.pageSize;
    this.loadPage();
  }

  previousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }
    this.offset = Math.max(0, this.offset - this.pageSize);
    this.loadPage();
  }

  get hasNextPage(): boolean {
    return this.offset + this.pageSize < this.total;
  }

  get hasPreviousPage(): boolean {
    return this.offset > 0;
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.pageSize) + 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /** trackBy para que *ngFor no re-renderice tarjetas que no cambiaron. */
  trackByPokemonId(_index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}
