'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchMangaById, MangaDetail } from '@/lib/api';

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchManga();
    }
  }, [id]);

  const fetchManga = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMangaById(id);
      setManga(data);
    } catch (err) {
      setError('Failed to load manga details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
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
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <button
              onClick={fetchManga}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : manga ? (
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cover Image */}
              <div className="md:col-span-1">
                <div className="relative aspect-[3/4] border-2 border-black rounded-lg overflow-hidden">
                  {manga.coverImage ? (
                    <Image
                      src={manga.coverImage}
                      alt={manga.mangaTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold mb-4">{manga.mangaTitle}</h1>
                
                <div className="space-y-4 mb-6">
                  {manga.score && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-red-600">{manga.score}</span>
                      <span className="text-gray-600">/ 10</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(manga.score / 2) ? 'text-red-600' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {manga.author && (
                    <div>
                      <span className="font-semibold text-black">Author: </span>
                      <span className="text-gray-700">{manga.author}</span>
                    </div>
                  )}
                </div>

                {/* Synopsis */}
                {manga.synopsis && (
                  <div className="border-t-2 border-black pt-6">
                    <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {manga.synopsis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

