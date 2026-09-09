/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Pokemon API. Defaults to the public PokeAPI instance
   *  when unset — see .env.example. */
  readonly VITE_POKEAPI_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
