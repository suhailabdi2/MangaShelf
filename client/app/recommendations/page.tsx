'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import UserMenu from '@/components/UserMenu';
import RecommendationRail from '@/components/RecommendationRail';
import { getForYouRecommendations, getTrendingRecommendations } from '@/lib/api';

export default function RecommendationsPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoggedIn(Boolean(localStorage.getItem('token')));
    }
  }, []);

  const trendingQuery = useQuery({
    queryKey: ['recommendations-page', 'trending'],
    queryFn: () => getTrendingRecommendations(18),
  });

  const forYouQuery = useInfiniteQuery({
    queryKey: ['recommendations-page', 'for-you'],
    queryFn: ({ pageParam }) => getForYouRecommendations(pageParam as number),
    initialPageParam: 12,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length >= 4 || lastPage.manga.length < 10) return undefined;
      return 12 + allPages.length * 6;
    },
    enabled: loggedIn,
  });

  const personalized = forYouQuery.data
    ? {
        manga: forYouQuery.data.pages.flatMap((p) => p.manga),
        scores: forYouQuery.data.pages.flatMap((p) => p.scores),
        reasoning: forYouQuery.data.pages.flatMap((p) => p.reasoning),
      }
    : undefined;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-black hover:text-red-600 transition-colors">
            Manga<span className="text-red-600">Shelf</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-4xl font-bold">Recommendations</h1>
          <p className="text-gray-600 mt-2">Hybrid recommendations powered by content similarity, collaborative filtering, and semantic embeddings.</p>
        </div>

        {loggedIn && (
          <>
            <RecommendationRail
              title="Recommended For You"
              subtitle="Personalized from your status history, ratings, and favorites."
              data={personalized}
              loading={forYouQuery.isLoading}
            />
            {forYouQuery.hasNextPage && (
              <button
                onClick={() => forYouQuery.fetchNextPage()}
                disabled={forYouQuery.isFetchingNextPage}
                className="mt-4 px-6 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
              >
                {forYouQuery.isFetchingNextPage ? 'Loading more...' : 'Load more'}
              </button>
            )}
          </>
        )}

        <RecommendationRail
          title="Trending Manga"
          subtitle="Momentum-based picks from engagement and community activity."
          data={trendingQuery.data}
          loading={trendingQuery.isLoading}
        />

        {!loggedIn && (
          <div className="mt-10 p-4 border-2 border-black rounded-lg bg-gray-50">
            <p className="text-sm text-gray-700">
              Sign in and start tracking manga to unlock personalized recommendations with confidence scores and explanations.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
