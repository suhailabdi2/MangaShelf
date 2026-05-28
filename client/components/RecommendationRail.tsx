'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RecommendationPayload } from '@/lib/api';

interface RecommendationRailProps {
  title: string;
  subtitle?: string;
  data?: RecommendationPayload;
  loading?: boolean;
  compact?: boolean;
}

function RecommendationSkeleton({ compact = false }: { compact?: boolean }) {
  const count = compact ? 4 : 6;
  return (
    <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6'} gap-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg border-2 border-black" />
          <div className="h-4 bg-gray-200 rounded mt-2" />
          <div className="h-3 bg-gray-200 rounded mt-1 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function RecommendationRail({
  title,
  subtitle,
  data,
  loading = false,
  compact = false,
}: RecommendationRailProps) {
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {loading ? (
        <RecommendationSkeleton compact={compact} />
      ) : (
        <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6'} gap-4`}>
          {(data?.manga || []).map((manga, idx) => (
            <Link
              key={`${manga._id}-${idx}`}
              href={`/manga/${manga.mal_id}`}
              className="border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
            >
              <div className="relative aspect-[3/4] bg-gray-100">
                {manga.coverImage ? (
                  <Image src={manga.coverImage} alt={manga.mangaTitle} fill className="object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm line-clamp-2">{manga.mangaTitle}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{data?.reasoning[idx] || 'Matched to your profile'}</p>
                <p className="text-xs text-red-600 mt-1">
                  Confidence {((data?.scores[idx]?.confidence ?? 0) * 100).toFixed(0)}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
