'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  fetchMangaById, 
  MangaDetail, 
  getMangaReviews, 
  createReview, 
  updateReview, 
  deleteReview,
  Review,
  ReviewsResponse 
} from '@/lib/api';
import UserMenu from '@/components/UserMenu';
import ReadingStatusSelector from '@/components/ReadingStatusSelector';
import { useToast } from '@/contexts/ToastContext';

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const reviewsPerPage = 10;
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    }
    if (id) {
      fetchManga();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [currentPage, sortBy]);

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

  const fetchReviews = async () => {
    try {
      const data = await getMangaReviews(id, currentPage, reviewsPerPage, sortBy);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleCreateReview = async (reviewData: { rating: number; comment: string; spoilerTagged: boolean }) => {
    try {
      await createReview(id, reviewData);
      setShowReviewForm(false);
      setCurrentPage(1); // Reset to first page after creating review
      fetchReviews();
      fetchManga(); // Refresh manga to get updated score
      showToast('Review created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create review', 'error');
    }
  };

  const handleUpdateReview = async (reviewId: string, reviewData: { rating: number; comment: string; spoilerTagged: boolean }) => {
    try {
      await updateReview(id, reviewId, reviewData);
      setEditingReview(null);
      fetchReviews();
      fetchManga(); // Refresh manga to get updated score
      showToast('Review updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update review', 'error');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id, reviewId);
      // If we're on a page that might become empty, go back a page
      if (reviews && reviews.reviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchReviews();
      }
      fetchManga(); // Refresh manga to get updated score
      showToast('Review deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className="flex items-center gap-4">
              <UserMenu />
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
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

                {/* Reading Status Selector */}
                {user && (
                  <div className="border-t-2 border-black pt-6">
                    <ReadingStatusSelector malId={id} />
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 border-t-2 border-black pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold">
                  Reviews {reviews && `(${reviews.totalReviews})`}
                </h2>
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                  {user && !showReviewForm && !editingReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>

              {/* Review Form */}
              {(showReviewForm || editingReview) && (
                <ReviewForm
                  review={editingReview}
                  onSubmit={editingReview 
                    ? (data) => handleUpdateReview(editingReview._id, data)
                    : handleCreateReview}
                  onCancel={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                />
              )}

              {/* Reviews List */}
              {reviews && reviews.reviews.length > 0 ? (
                <>
                  <div className="space-y-6 mt-8">
                    {reviews.reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        currentUserId={user?.id}
                        onEdit={() => setEditingReview(review)}
                        onDelete={() => handleDeleteReview(review._id)}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {reviews.totalPages && reviews.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!reviews.hasPrevPage}
                        className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, reviews.totalPages || 1) }, (_, i) => {
                          const totalPages = reviews.totalPages || 1;
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 border-2 border-black rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white text-black hover:bg-black hover:text-white'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!reviews.hasNextPage}
                        className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                  
                  {/* Page Info */}
                  {reviews.totalPages && reviews.totalPages > 1 && (
                    <p className="text-center text-gray-600 text-sm mt-4">
                      Page {reviews.currentPage || 1} of {reviews.totalPages}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

// Review Form Component
function ReviewForm({ 
  review, 
  onSubmit, 
  onCancel 
}: { 
  review: Review | null; 
  onSubmit: (data: { rating: number; comment: string; spoilerTagged: boolean }) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || '');
  const [spoilerTagged, setSpoilerTagged] = useState(review?.spoilerTagged || false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter a comment', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ rating, comment, spoilerTagged });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-black rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">{review ? 'Edit Review' : 'Write a Review'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">Rating (1-10)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xl font-bold text-red-600 w-12 text-center">{rating}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Share your thoughts about this manga..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="spoiler"
            checked={spoilerTagged}
            onChange={(e) => setSpoilerTagged(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="spoiler" className="text-sm text-gray-700">
            This review contains spoilers
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-red-700 transition-colors disabled:opacity-70"
          >
            {loading ? 'Submitting...' : review ? 'Update Review' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Review Card Component
function ReviewCard({ 
  review, 
  currentUserId, 
  onEdit, 
  onDelete 
}: { 
  review: Review; 
  currentUserId?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOwner = currentUserId && review.userId._id === currentUserId;
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <div className="border-2 border-black rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-black">{review.userId.userName}</span>
            <span className="text-red-600 font-bold">{review.rating}/10</span>
            {review.spoilerTagged && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Spoiler</span>
            )}
          </div>
          <p className="text-sm text-gray-600">{date}</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm border border-black rounded hover:bg-black hover:text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
    </div>
  );
}

