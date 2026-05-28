# Recommendation System Architecture

## 1) Folder Structure

```text
server/
  controllers/
    recommendationController.js
  routes/
    recommendationRoutes.js
  jobs/
    embeddingJob.js
  scripts/
    recomputeEmbeddings.js
  models/
    UserMangaLog.js
    Rating.js
    Embedding.js
    RecommendationCache.js
  services/recommendation/
    recommendationService.js
    embeddingProvider.js
    vectorUtils.js
    vectorUtils.test.js

client/
  components/
    QueryProvider.tsx
    RecommendationShelf.tsx
  lib/
    api.ts
  app/
    page.tsx
    manga/[id]/page.tsx
```

## 2) Database Schemas and Indexes

- `UserMangaLog`: status + favorite state + recent interaction timestamp.
  - Indexes: `{ userId, mangaId } unique`, `{ userId, status, updatedAt }`
- `Rating`: normalized rating table for collaborative filtering.
  - Indexes: `{ userId, mangaId } unique`, `{ mangaId, rating }`
- `Embedding`: vector + content hash + generation metadata.
  - Indexes: `{ mangaId } unique`, `{ generatedAt }`, `{ contentHash }`
- `RecommendationCache`: cached payload + TTL.
  - Indexes: `{ cacheKey } unique`, TTL index on `expiresAt`
- `Manga`: enriched with `genres`, `tags`, `themes`, `demographics`, `members`, `favoritesCount`.
  - Indexes: metadata index for content matching + popularity ranking index.

## 3) Backend Implementation

- Service layer in `recommendationService` coordinates:
  - content similarity
  - semantic similarity
  - collaborative user-user signal
  - popularity fallback
  - cache read/write
- Controller layer handles API and auth boundaries.
- Scheduler (`embeddingJob`) refreshes embeddings with configurable interval.

## 4) Recommendation Algorithms

- Content-based:
  - TF-IDF over title/synopsis/genre/tag/theme/demographic/author.
  - Cosine similarity for nearest-neighbor retrieval.
- Collaborative:
  - User-user nearest-neighbor with overlap-weighted similarity from `Rating`.
  - Sparse-safe cold-start fallback to trending/popular.
- Hybrid ranking:
  - `0.4 * content + 0.2 * semantic + 0.3 * collaborative + 0.1 * popularity`
- Confidence:
  - Min-max normalized confidence score per result set.

## 5) AI Embedding Pipeline

- Embedding text built from: title + synopsis + genres + tags + themes + demographics + author.
- Provider abstraction:
  - OpenAI (`OPENAI_API_KEY`) when configured.
  - Local deterministic hash embedding fallback (no external dependency).
- Scheduled generation:
  - periodic background job
  - manual full refresh via script

## 6) Frontend Components

- `RecommendationShelf`:
  - Recommended For You
  - Trending Manga
  - skeleton states
  - infinite expansion (`useInfiniteQuery`)
  - reasoning + confidence display
- Manga detail page:
  - “Because You Read…” similar shelf

## 7) API Examples

- `GET /api/recommendations` (auth)
- `GET /api/recommendations/for-you` (auth)
- `GET /api/recommendations/similar/:mangaId`
- `GET /api/recommendations/trending`

Response shape:

```json
{
  "manga": [{ "_id": "...", "mangaTitle": "..." }],
  "scores": [{ "score": 0.82, "confidence": 0.91 }],
  "reasoning": ["Because you liked ..."]
}
```

## 8) Scaling Considerations

- Cache personalization/trending responses with TTL.
- Denormalized `UserMangaLog` + `Rating` avoids expensive joins.
- Incremental embedding regeneration via content hash checks.
- Recommendation service can be split into independent workers (content/collab/embedding) later.

## 9) Future Improvements

- Add ANN vector index (Mongo Atlas Vector Search / Pinecone / Weaviate).
- Replace user-user CF with matrix factorization (ALS/BPR).
- Contextual re-ranking with online feedback features.
- Bandit/A-B test layer for exploration vs exploitation.
- Seasonal + mood features as explicit query filters and prompts.
