/** Wire contract between the playground (client) and /api/search (route handler). */

export interface ResultCard {
  title: string;
  url: string;
  domain: string;
  content: string;
  engines: string[];
  category: string;
  published: string | null;
  thumbnail: string | null;
  image: string | null;
}

export interface SearchMeta {
  query: string;
  shown: number;
  total: number;
  elapsedMs: number;
  engines: string[];
  unresponsive: string[];
  corrections: string[];
  suggestions: string[];
}

export interface SearchPayload {
  /** What the MCP tool hands back to the model, byte for byte. */
  text: string;
  results: ResultCard[];
  meta: SearchMeta;
}

export interface SearchError {
  error: string;
  hint?: string;
}
