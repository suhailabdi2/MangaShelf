'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchManga, MangaSearchResult } from '@/lib/api';
import Image from 'next/image';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<MangaSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      fetchResults(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchManga(searchQuery);
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to search manga. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black hover:text-red-600 transition-colors">
              Manga<span className="text-red-600">Shelf</span>
            </Link>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors border-2 border-black"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <button
              onClick={() => query && fetchResults(query)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : !query ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Enter a search query to find manga</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No results found for &quot;{query}&quot;</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Search Results for &quot;{query}&quot;
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((manga) => (
                <Link
                  key={manga.mal_id}
                  href={`/manga/${manga.mal_id}`}
                  className="group border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-64 bg-gray-100">
                    {manga.images?.jpg?.image_url ? (
                      <Image
                        src={manga.images.jpg.image_url}
                        alt={manga.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {manga.title_english || manga.title}
                    </h3>
                    {manga.score && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 font-bold">{manga.score}</span>
                        <span className="text-gray-600">/ 10</span>
                      </div>
                    )}
                    {manga.synopsis && (
                      <p className="text-gray-600 text-sm line-clamp-3">{manga.synopsis}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

