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

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    userName: string;
    userEmail: string;
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

export async function signupUser(data: {
  userName: string;
  userEmail: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to sign up');
  }
  return payload;
}

export async function loginUser(data: {
  userEmail: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to log in');
  }
  return payload;
}

// Review interfaces
export interface Review {
  _id: string;
  userId: {
    _id: string;
    userName: string;
  };
  mangaId: string;
  rating: number;
  comment: string;
  spoilerTagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalReviews: number;
  averageScore: number;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
  spoilerTagged?: boolean;
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Review API functions
export async function getMangaReviews(malId: number): Promise<ReviewsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/review/manga/${malId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
}

export async function createReview(malId: number, data: CreateReviewData): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to create a review');
  }

  const response = await fetch(`${API_BASE_URL}/api/review/postreview/${malId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to create review');
  }
  return payload;
}

export async function updateReview(
  malId: number,
  reviewId: string,
  data: CreateReviewData
): Promise<{ message: string; review: Review }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to update a review');
  }

  const response = await fetch(`${API_BASE_URL}/api/review/updatereview/${malId}/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to update review');
  }
  return payload;
}

export async function deleteReview(malId: number, reviewId: string): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to delete a review');
  }

  const response = await fetch(`${API_BASE_URL}/api/review/deletereview/${malId}/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to delete review');
  }
  return payload;
}

