import type {
  NamedApiResource,
  PokemonDetailResponse,
  PokemonListResponse,
} from "../types/pokemon";

const BASE_URL = import.meta.env.VITE_POKEAPI_BASE_URL;

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal });
  } catch {
    throw new ApiError("Network error — check your connection and try again.");
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "Not found."
        : `PokeAPI request failed (${response.status}).`,
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

/**
 * The full name+url index of every Pokemon. PokeAPI has no text-search
 * endpoint, so we fetch this single lightweight list once and filter it
 * client-side to implement search — far cheaper than paging through 1300+
 * individual lookups.
 */
export async function fetchAllPokemonNames(
  signal?: AbortSignal,
): Promise<NamedApiResource[]> {
  const data = await request<PokemonListResponse>(
    "/pokemon?limit=100000&offset=0",
    signal,
  );
  return data.results;
}

export async function fetchPokemonByName(
  name: string,
  signal?: AbortSignal,
): Promise<PokemonDetailResponse> {
  return request<PokemonDetailResponse>(`/pokemon/${name}`, signal);
}

export function idFromResourceUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : 0;
}
