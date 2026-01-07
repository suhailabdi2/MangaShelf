const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MangaSearchResult {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  synopsis?: string;
  score?: number;
  authors?: Array<{ name: string }>;
  type?: string;
  chapters?: number;
  volumes?: number;
}

export interface MangaDetail {
  mal_id: number;
  mangaTitle: string;
  coverImage: string;
  synopsis: string;
  score: number;
  author: string;
}

export interface SearchResponse {
  results: MangaSearchResult[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

export async function searchManga(query: string): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/manga?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search manga');
  }
  return response.json();
}

export async function fetchMangaById(malId: number): Promise<MangaDetail> {
  const response = await fetch(`${API_BASE_URL}/api/manga/search/${malId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch manga');
  }
  return response.json();
}

