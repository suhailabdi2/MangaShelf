'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUserReviews, getUserMangaByStatus, getProfilePicture, UserReviewsResponse, UserMangaResponse } from '@/lib/api';
import UserMenu from '@/components/UserMenu';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [reviews, setReviews] = useState<UserReviewsResponse | null>(null);
  const [library, setLibrary] = useState<UserMangaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'library'>('overview');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);
      }
    }
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile picture and user data
      const [profileData, reviewsData, libraryData] = await Promise.all([
        getProfilePicture(userId).catch(() => ({ profilePicture: null, userName: '', userEmail: '' })),
        getUserReviews(userId).catch(() => ({ reviews: [], totalReviews: 0 })),
        getUserMangaByStatus(userId, 'all').catch(() => ({ manga: [], total: 0 }))
      ]);
      
      setProfilePicture(profileData.profilePicture);
      setReviews(reviewsData);
      setLibrary(libraryData);
      
      // Set profile user
      if (currentUser && currentUser.id === userId) {
        setProfileUser({
          ...currentUser,
          profilePicture: profileData.profilePicture || currentUser.profilePicture
        });
      } else {
        // For other users, use the fetched data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const localUser = JSON.parse(userStr);
          setProfileUser({
            ...localUser,
            userName: profileData.userName || localUser.userName,
            userEmail: profileData.userEmail || localUser.userEmail,
            profilePicture: profileData.profilePicture
          });
        }
      }
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = (newPictureUrl: string) => {
    setProfilePicture(newPictureUrl);
    if (profileUser) {
      setProfileUser({
        ...profileUser,
        profilePicture: newPictureUrl
      });
    }
  };

  // Calculate stats
  const stats = {
    totalReviews: reviews?.totalReviews || 0,
    totalLibrary: library?.total || 0,
    averageRating: reviews?.reviews.length 
      ? (reviews.reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.reviews.length).toFixed(1)
      : '0',
    completed: library?.manga.filter(m => m.status === 'completed').length || 0,
    reading: library?.manga.filter(m => m.status === 'reading').length || 0,
    planToRead: library?.manga.filter(m => m.status === 'plan_to_read').length || 0,
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
            <p className="mt-4 text-gray-600">Loading profile...</p>
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
              onClick={fetchProfileData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

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
        {/* Profile Header */}
        <div className="border-2 border-black rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {isOwnProfile ? (
              <ProfilePictureUpload
                currentPicture={profilePicture || undefined}
                userName={profileUser?.userName || 'User'}
                onUploadSuccess={handlePictureUpload}
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-red-600 flex items-center justify-center flex-shrink-0">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt={profileUser?.userName || 'User'}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white">
                    {profileUser?.userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{profileUser?.userName || 'User'}</h1>
              <p className="text-gray-600">{profileUser?.userEmail || ''}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalReviews}</div>
            <div className="text-gray-600 font-semibold">Reviews</div>
          </div>
          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalLibrary}</div>
            <div className="text-gray-600 font-semibold">In Library</div>
          </div>
          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.averageRating}</div>
            <div className="text-gray-600 font-semibold">Avg Rating</div>
          </div>
          <div className="border-2 border-black rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.completed}</div>
            <div className="text-gray-600 font-semibold">Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-black">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-4 transition-colors ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold border-b-4 transition-colors ${
              activeTab === 'reviews'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Reviews ({stats.totalReviews})
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-semibold border-b-4 transition-colors ${
              activeTab === 'library'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Library ({stats.totalLibrary})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Reading Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.planToRead}</div>
                  <div className="text-sm text-gray-600">Plan to Read</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{stats.reading}</div>
                  <div className="text-sm text-gray-600">Reading</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {library?.manga.filter(m => m.status === 'on_hold').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">On Hold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {library?.manga.filter(m => m.status === 'dropped').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Dropped</div>
                </div>
              </div>
            </div>

            {reviews && reviews.reviews.length > 0 && (
              <div className="border-2 border-black rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {reviews.reviews.slice(0, 3).map((review) => (
                    <Link
                      key={review._id}
                      href={`/manga/${review.mangaId.mal_id}`}
                      className="block border-2 border-black rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {review.mangaId.coverImage && (
                          <div className="relative w-16 h-24 flex-shrink-0">
                            <Image
                              src={review.mangaId.coverImage}
                              alt={review.mangaId.mangaTitle}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{review.mangaId.mangaTitle}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-600 font-bold">{review.rating}</span>
                            <span className="text-gray-600">/ 10</span>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-2">{review.comment}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {reviews.reviews.length > 3 && (
                  <Link
                    href={`/profile/${userId}?tab=reviews`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('reviews');
                    }}
                    className="block mt-4 text-center text-red-600 font-semibold hover:underline"
                  >
                    View All Reviews →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews && reviews.reviews.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.reviews.map((review) => (
                  <Link
                    key={review._id}
                    href={`/manga/${review.mangaId.mal_id}`}
                    className="border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {review.mangaId.coverImage ? (
                        <Image
                          src={review.mangaId.coverImage}
                          alt={review.mangaId.mangaTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-2">{review.mangaId.mangaTitle}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 font-bold">{review.rating}</span>
                        <span className="text-gray-600">/ 10</span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-3">{review.comment}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No reviews yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div>
            {library && library.manga.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {library.manga.map((item) => (
                  <Link
                    key={item._id}
                    href={`/manga/${item.manga.mal_id}`}
                    className="border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
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
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm font-bold line-clamp-2">{item.manga.mangaTitle}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No manga in library yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

