'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUserReviews, UserReview, UserReviewsResponse, deleteReview } from '@/lib/api';
import UserMenu from '@/components/UserMenu';

export default function MyReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<UserReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        fetchReviews(userData.id);
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const fetchReviews = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserReviews(userId);
      setReviews(data);
    } catch (err) {
      setError('Failed to load your reviews. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (review: UserReview) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const malId = typeof review.mangaId.mal_id === 'string' 
        ? parseInt(review.mangaId.mal_id) 
        : review.mangaId.mal_id;
      await deleteReview(malId, review._id);
      // Refresh reviews after deletion
      if (user) {
        fetchReviews(user.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading your reviews...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
              onClick={() => user && fetchReviews(user.id)}
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
          <h1 className="text-4xl font-bold mb-2">My Reviews</h1>
          {reviews && (
            <p className="text-gray-600">
              You have reviewed {reviews.totalReviews} {reviews.totalReviews === 1 ? 'manga' : 'manga'}
            </p>
          )}
        </div>

        {reviews && reviews.reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">You haven't reviewed any manga yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-red-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews?.reviews.map((review) => {
              const malId = review.mangaId?.mal_id;
              const mangaTitle = review.mangaId?.mangaTitle || 'Unknown Manga';
              const coverImage = review.mangaId?.coverImage;
              
              return (
                <div
                  key={review._id}
                  className="border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {malId ? (
                    <Link href={`/manga/${malId}`}>
                      <div className="relative aspect-[3/4] bg-gray-100">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={mangaTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={mangaTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {malId ? (
                      <Link href={`/manga/${malId}`}>
                        <h3 className="text-xl font-bold mb-2 hover:text-red-600 transition-colors">
                          {mangaTitle}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="text-xl font-bold mb-2">
                        {mangaTitle}
                      </h3>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-600 font-bold text-lg">{review.rating}</span>
                      <span className="text-gray-600">/ 10</span>
                      {review.spoilerTagged && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Spoiler</span>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{review.comment}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.updatedAt !== review.createdAt && (
                        <span className="text-gray-400">(Edited)</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {malId ? (
                        <Link
                          href={`/manga/${malId}`}
                          className="flex-1 px-4 py-2 text-center border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors text-sm font-semibold"
                        >
                          View Manga
                        </Link>
                      ) : (
                        <div className="flex-1 px-4 py-2 text-center border-2 border-gray-300 rounded-lg text-gray-400 text-sm font-semibold">
                          View Manga
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
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

