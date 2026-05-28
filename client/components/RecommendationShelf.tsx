'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getForYouRecommendations, getTrendingRecommendations, RecommendationPayload } from '@/lib/api';
import { useEffect, useRef } from 'react';

function ShelfSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg border-2 border-black" />
          <div className="h-4 bg-gray-200 rounded mt-2" />
          <div className="h-3 bg-gray-200 rounded mt-1 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function ShelfList({
  title,
  data,
}: {
  title: string;
  data?: RecommendationPayload;
}) {
  if (!data) return null;
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {data.manga.map((manga, idx) => (
          <Link
            key={`${manga._id}-${idx}`}
            href={`/manga/${manga.mal_id}`}
            className="border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <div className="relative aspect-[3/4]">
              {manga.coverImage ? (
                <Image src={manga.coverImage} alt={manga.mangaTitle} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">No Image</div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm line-clamp-2">{manga.mangaTitle}</h3>
              <p className="text-xs text-gray-600 mt-1">{data.reasoning[idx] || 'Matched to your taste profile'}</p>
              <p className="text-xs text-red-600 mt-1">
                Relevance {(data.scores[idx]?.confidence ?? 0).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function RecommendationShelf({ loggedIn }: { loggedIn: boolean }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const trendingQuery = useQuery({
    queryKey: ['recommendations', 'trending'],
    queryFn: () => getTrendingRecommendations(10),
  });

  const forYouQuery = useInfiniteQuery({
    queryKey: ['recommendations', 'for-you'],
    queryFn: ({ pageParam }) => getForYouRecommendations(pageParam),
    initialPageParam: 10,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.manga.length < 10 || allPages.length >= 3) return undefined;
      return (allPages.length + 1) * 10;
    },
    enabled: loggedIn,
  });

  useEffect(() => {
    if (!loggedIn || !forYouQuery.hasNextPage || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && forYouQuery.hasNextPage && !forYouQuery.isFetchingNextPage) {
          forYouQuery.fetchNextPage();
        }
      },
      { rootMargin: '240px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loggedIn, forYouQuery.hasNextPage, forYouQuery.isFetchingNextPage, forYouQuery.fetchNextPage]);

  const mergedForYou: RecommendationPayload | undefined = forYouQuery.data
    ? {
        manga: forYouQuery.data.pages.flatMap((p) => p.manga),
        scores: forYouQuery.data.pages.flatMap((p) => p.scores),
        reasoning: forYouQuery.data.pages.flatMap((p) => p.reasoning),
      }
    : undefined;

  return (
    <div className="max-w-6xl mx-auto mt-14 border-t-2 border-black pt-8">
      {loggedIn && (
        <>
          {forYouQuery.isLoading ? <ShelfSkeleton /> : <ShelfList title="Recommended For You" data={mergedForYou} />}
          {!forYouQuery.isLoading && mergedForYou && mergedForYou.manga.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">Start rating or tracking manga to unlock personalized recommendations.</p>
          )}
          {forYouQuery.isError && (
            <p className="text-sm text-red-600 mt-2">Could not load personalized recommendations right now.</p>
          )}
          {forYouQuery.hasNextPage && (
            <div ref={sentinelRef} className="mt-4 py-3 text-center text-sm text-gray-600">
              {forYouQuery.isFetchingNextPage ? 'Loading more recommendations...' : 'Scroll for more'}
            </div>
          )}
        </>
      )}

      {trendingQuery.isLoading ? <ShelfSkeleton /> : <ShelfList title="Trending Manga" data={trendingQuery.data} />}
      {trendingQuery.isError && <p className="text-sm text-red-600 mt-2">Could not load trending manga.</p>}
    </div>
  );
}
