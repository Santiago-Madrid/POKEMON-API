/**
 * Respuesta cruda del endpoint de LISTA:
 * GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0
 * Solo trae nombre + url, NO el detalle.
 */
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

/**
 * Respuesta del endpoint de DETALLE:
 * GET https://pokeapi.co/api/v2/pokemon/:id_o_nombre
 * Solo modelamos los campos que realmente usamos en la UI,
 * pero tipados de punta a punta (nada de "any").
 */
export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbilitySlot[];
}

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    ['official-artwork']?: {
      front_default: string | null;
    };
  };
}

export interface PokemonTypeSlot {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbilitySlot {
  is_hidden: boolean;
  ability: {
    name: string;
    url: string;
  };
}

/**
 * Modelo "de presentación": lo que realmente consume el componente.
 * Es el resultado de aplanar PokemonDetailResponse con el `map` del
 * servicio, para no acoplar la plantilla a la forma cruda de la API.
 */
export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  height: number;
  weight: number;
  baseExperience: number;
  abilities: string[];
}
