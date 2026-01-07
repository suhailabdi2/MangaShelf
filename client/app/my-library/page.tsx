'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUserMangaByStatus, MangaWithStatus, ReadingStatus } from '@/lib/api';
import UserMenu from '@/components/UserMenu';

const STATUS_TABS: { value: string; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-gray-600' },
  { value: 'plan_to_read', label: 'Plan to Read', color: 'bg-blue-600' },
  { value: 'reading', label: 'Reading', color: 'bg-green-600' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-600' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-600' },
  { value: 'dropped', label: 'Dropped', color: 'bg-red-600' },
];

export default function MyLibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [manga, setManga] = useState<MangaWithStatus[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        fetchManga(userData.id, 'all');
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const fetchManga = async (userId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserMangaByStatus(userId, status);
      setManga(data.manga);
    } catch (err) {
      setError('Failed to load your library. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    if (user) {
      fetchManga(user.id, status);
    }
  };

  if (loading && manga.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-black hover:text-red-600 transition-colors">
                Manga<span className="text-red-600">Shelf</span>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading your library...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && manga.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b-2 border-black">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-black hover:text-red-600 transition-colors">
                Manga<span className="text-red-600">Shelf</span>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <button
              onClick={() => user && fetchManga(user.id, activeTab)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black hover:text-red-600 transition-colors">
              Manga<span className="text-red-600">Shelf</span>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Library</h1>
          <p className="text-gray-600">
            {manga.length} {manga.length === 1 ? 'manga' : 'manga'} {activeTab !== 'all' ? `in ${STATUS_TABS.find(t => t.value === activeTab)?.label}` : 'total'}
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-black pb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-lg border-2 border-black font-semibold transition-colors ${
                activeTab === tab.value
                  ? `${tab.color} text-white`
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Manga Grid */}
        {manga.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">
              {activeTab === 'all'
                ? "You haven't added any manga to your library yet."
                : `You don't have any manga marked as "${STATUS_TABS.find(t => t.value === activeTab)?.label}".`}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-red-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {manga.map((item) => {
              const statusInfo = STATUS_TABS.find(t => t.value === item.status);
              return (
                <div
                  key={item._id}
                  className="border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/manga/${item.manga.mal_id}`}>
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {item.manga.coverImage ? (
                        <Image
                          src={item.manga.coverImage}
                          alt={item.manga.mangaTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                      {statusInfo && (
                        <div className={`absolute top-2 right-2 px-2 py-1 ${statusInfo.color} text-white text-xs font-semibold rounded border border-black`}>
                          {statusInfo.label}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-2">
                    <Link href={`/manga/${item.manga.mal_id}`}>
                      <h3 className="text-sm font-bold mb-1 line-clamp-2 hover:text-red-600 transition-colors">
                        {item.manga.mangaTitle}
                      </h3>
                    </Link>
                    {item.manga.score > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-red-600 font-bold">{item.manga.score.toFixed(1)}</span>
                        <span className="text-gray-600">/ 10</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

