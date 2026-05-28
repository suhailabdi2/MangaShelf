const crypto = require("crypto");
const mongoose = require("mongoose");
const Manga = require("../../models/Manga");
const Review = require("../../models/Review");
const Rating = require("../../models/Rating");
const ReadingStatus = require("../../models/ReadingStatus");
const { UserMangaLog } = require("../../models/UserMangaLog");
const Embedding = require("../../models/Embedding");
const RecommendationCache = require("../../models/RecommendationCache");
const { buildTfIdfVectors, cosineSimilarity } = require("./vectorUtils");
const { buildEmbeddingText, generateEmbeddingForText } = require("./embeddingProvider");

const STATUS_WEIGHT = {
  completed: 1,
  reading: 0.8,
  plan_to_read: 0.3,
  on_hold: 0.2,
  dropped: -0.5,
};

async function getUserSignals(userId) {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const [statuses, reviews, ratings, logs] = await Promise.all([
    ReadingStatus.find({ userId: objectUserId }).populate("mangaId"),
    Review.find({ userId: objectUserId }).populate("mangaId"),
    Rating.find({ userId: objectUserId }),
    UserMangaLog.find({ userId: objectUserId }),
  ]);

  const loggedMangaIds = new Set();
  const weightedInteractions = [];

  statuses.forEach((s) => {
    if (!s.mangaId?._id) return;
    loggedMangaIds.add(String(s.mangaId._id));
    weightedInteractions.push({
      mangaId: s.mangaId._id,
      weight: STATUS_WEIGHT[s.status] ?? 0.1,
      reason: `Reading status: ${s.status}`,
      seedTitle: s.mangaId.mangaTitle,
    });
  });

  logs.forEach((log) => {
    loggedMangaIds.add(String(log.mangaId));
    weightedInteractions.push({
      mangaId: log.mangaId,
      weight: (STATUS_WEIGHT[log.status] ?? 0.1) + (log.isFavorite ? 0.5 : 0),
      reason: log.isFavorite ? "Marked as favorite" : `User log: ${log.status}`,
    });
  });

  reviews.forEach((r) => {
    if (!r.mangaId?._id) return;
    loggedMangaIds.add(String(r.mangaId._id));
    weightedInteractions.push({
      mangaId: r.mangaId._id,
      weight: (r.rating - 5.5) / 4.5,
      reason: `You rated ${r.rating}/10`,
      seedTitle: r.mangaId.mangaTitle,
    });
  });

  ratings.forEach((r) => {
    loggedMangaIds.add(String(r.mangaId));
    weightedInteractions.push({
      mangaId: r.mangaId,
      weight: (r.rating - 5.5) / 4.5,
      reason: `Rating signal ${r.rating}/10`,
    });
  });

  return { loggedMangaIds, weightedInteractions };
}

function normalizeScores(recommendations) {
  if (!recommendations.length) return recommendations;
  const maxScore = Math.max(...recommendations.map((r) => r.score));
  const minScore = Math.min(...recommendations.map((r) => r.score));
  const range = maxScore - minScore || 1;
  return recommendations.map((r) => ({
    ...r,
    confidence: Number(((r.score - minScore) / range).toFixed(4)),
  }));
}

async function getOrSetCache(cacheKey, type, userId, ttlSec, compute) {
  const now = new Date();
  const cached = await RecommendationCache.findOne({ cacheKey, expiresAt: { $gt: now } });
  if (cached) return cached.payload;
  const payload = await compute();
  await RecommendationCache.findOneAndUpdate(
    { cacheKey },
    {
      cacheKey,
      type,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      payload,
      expiresAt: new Date(now.getTime() + ttlSec * 1000),
    },
    { upsert: true, new: true }
  );
  return payload;
}

async function contentBasedSimilarManga(mangaId, excludeSet = new Set(), limit = 10) {
  const allManga = await Manga.find({}).lean();
  const anchor = allManga.find((m) => String(m._id) === String(mangaId));
  if (!anchor) return [];

  const docs = allManga.map((m) =>
    [
      m.mangaTitle,
      m.author,
      (m.genres || []).join(" "),
      (m.tags || []).join(" "),
      (m.themes || []).join(" "),
      (m.demographics || []).join(" "),
      m.synopsis,
    ].join(" ")
  );
  const tfidf = buildTfIdfVectors(docs);
  const anchorIdx = allManga.findIndex((m) => String(m._id) === String(mangaId));
  if (anchorIdx < 0) return [];

  return allManga
    .map((m, idx) => ({
      manga: m,
      score: idx === anchorIdx ? -1 : cosineSimilarity(tfidf[anchorIdx], tfidf[idx]),
    }))
    .filter((r) => r.score > 0 && !excludeSet.has(String(r.manga._id)))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function upsertEmbedding(manga) {
  const text = buildEmbeddingText(manga);
  const contentHash = crypto.createHash("sha256").update(text).digest("hex");
  const existing = await Embedding.findOne({ mangaId: manga._id });
  if (existing && existing.contentHash === contentHash) return existing;
  const embedding = await generateEmbeddingForText(text);
  return Embedding.findOneAndUpdate(
    { mangaId: manga._id },
    {
      mangaId: manga._id,
      provider: embedding.provider,
      vector: embedding.vector,
      dimension: embedding.vector.length,
      contentHash,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

async function semanticSimilarManga(mangaId, excludeSet = new Set(), limit = 10) {
  const [allManga, allEmbeddings] = await Promise.all([Manga.find({}).lean(), Embedding.find({}).lean()]);
  const embeddingMap = new Map(allEmbeddings.map((e) => [String(e.mangaId), e]));
  const anchorEmbedding = embeddingMap.get(String(mangaId));
  if (!anchorEmbedding) return [];

  return allManga
    .filter((m) => String(m._id) !== String(mangaId))
    .map((m) => {
      const e = embeddingMap.get(String(m._id));
      if (!e) return null;
      return {
        manga: m,
        score: cosineSimilarity(anchorEmbedding.vector, e.vector),
      };
    })
    .filter((r) => r && r.score > 0 && !excludeSet.has(String(r.manga._id)))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function collaborativeRecommendations(userId, excludeSet = new Set(), limit = 30) {
  const ratings = await Rating.find({}).lean();
  const byUser = new Map();
  ratings.forEach((r) => {
    const key = String(r.userId);
    if (!byUser.has(key)) byUser.set(key, []);
    byUser.get(key).push(r);
  });
  const target = byUser.get(String(userId)) || [];
  if (!target.length) return [];

  const targetMap = new Map(target.map((r) => [String(r.mangaId), r.rating]));
  const peers = [];
  byUser.forEach((rows, peerUserId) => {
    if (peerUserId === String(userId)) return;
    const overlap = rows.filter((r) => targetMap.has(String(r.mangaId)));
    if (!overlap.length) return;
    const similarity =
      overlap.reduce((acc, r) => {
        const t = targetMap.get(String(r.mangaId));
        return acc + (1 - Math.abs(t - r.rating) / 9);
      }, 0) / overlap.length;
    if (similarity > 0.2) peers.push({ peerUserId, similarity, rows });
  });

  const candidateScores = new Map();
  peers.forEach(({ similarity, rows }) => {
    rows.forEach((r) => {
      const mangaKey = String(r.mangaId);
      if (targetMap.has(mangaKey) || excludeSet.has(mangaKey) || r.rating < 7) return;
      const current = candidateScores.get(mangaKey) || 0;
      candidateScores.set(mangaKey, current + similarity * (r.rating / 10));
    });
  });

  const candidates = Array.from(candidateScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const mangaMap = new Map((await Manga.find({ _id: { $in: candidates.map(([id]) => id) } }).lean()).map((m) => [String(m._id), m]));

  return candidates
    .map(([id, score]) => ({ manga: mangaMap.get(id), score }))
    .filter((x) => x.manga);
}

async function popularityFallback(excludeSet = new Set(), limit = 10) {
  const rows = await Manga.find({ _id: { $nin: Array.from(excludeSet) } })
    .sort({ reviewCount: -1, favoritesCount: -1, score: -1, members: -1 })
    .limit(limit)
    .lean();
  return rows.map((m, idx) => ({ manga: m, score: 1 - idx / Math.max(1, limit) }));
}

async function getSimilarRecommendationsByMalId(malId) {
  const manga = await Manga.findOne({ mal_id: String(malId) });
  if (!manga) return { manga: [], scores: [], reasoning: [] };
  await upsertEmbedding(manga);
  const cacheKey = `similar:${manga._id}`;
  return getOrSetCache(cacheKey, "similar", null, 3600, async () => {
    const [content, semantic] = await Promise.all([
      contentBasedSimilarManga(manga._id, new Set([String(manga._id)]), 30),
      semanticSimilarManga(manga._id, new Set([String(manga._id)]), 30),
    ]);
    const merged = new Map();
    content.forEach((r) => merged.set(String(r.manga._id), { ...r, contentScore: r.score, semanticScore: 0 }));
    semantic.forEach((r) => {
      const key = String(r.manga._id);
      const current = merged.get(key) || { manga: r.manga, contentScore: 0, semanticScore: 0 };
      current.semanticScore = r.score;
      merged.set(key, current);
    });
    const ranked = normalizeScores(
      Array.from(merged.values())
        .map((r) => ({
          manga: r.manga,
          score: 0.55 * r.contentScore + 0.45 * r.semanticScore,
          reasoning: `Shared genres/themes + semantic similarity with "${manga.mangaTitle}"`,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    );
    return {
      manga: ranked.map((r) => r.manga),
      scores: ranked.map((r) => ({ score: r.score, confidence: r.confidence })),
      reasoning: ranked.map((r) => r.reasoning),
    };
  });
}

async function getForUserRecommendations(userId, limit = 10) {
  const { loggedMangaIds, weightedInteractions } = await getUserSignals(userId);
  const cacheKey = `for-you:${userId}:${limit}`;
  return getOrSetCache(cacheKey, "for-you", userId, 900, async () => {
    if (!weightedInteractions.length) {
      const popular = await popularityFallback(loggedMangaIds, limit);
      return {
        manga: popular.map((r) => r.manga),
        scores: popular.map((r) => ({ score: r.score, confidence: r.score })),
        reasoning: popular.map(() => "Cold-start fallback: trending in the community"),
      };
    }

    // Build candidates from seed manga (content + semantic), then blend collaborative/popularity.
    const seedTop = weightedInteractions.sort((a, b) => b.weight - a.weight).slice(0, 8);
    const candidateMap = new Map();

    for (const seed of seedTop) {
      const seedManga = await Manga.findById(seed.mangaId);
      if (!seedManga) continue;
      await upsertEmbedding(seedManga);
      const [content, semantic] = await Promise.all([
        contentBasedSimilarManga(seed.mangaId, loggedMangaIds, 20),
        semanticSimilarManga(seed.mangaId, loggedMangaIds, 20),
      ]);
      content.forEach((r) => {
        const key = String(r.manga._id);
        const curr = candidateMap.get(key) || { manga: r.manga, content: 0, semantic: 0, collaborative: 0, popularity: 0, reason: [] };
        curr.content += Math.max(0, seed.weight) * r.score;
        curr.reason.push(`Because you liked ${seed.seedTitle || "similar manga"}`);
        candidateMap.set(key, curr);
      });
      semantic.forEach((r) => {
        const key = String(r.manga._id);
        const curr = candidateMap.get(key) || { manga: r.manga, content: 0, semantic: 0, collaborative: 0, popularity: 0, reason: [] };
        curr.semantic += Math.max(0, seed.weight) * r.score;
        curr.reason.push(`Semantically close to ${seed.seedTitle || "your history"}`);
        candidateMap.set(key, curr);
      });
    }

    const collaborative = await collaborativeRecommendations(userId, loggedMangaIds, 100);
    collaborative.forEach((r) => {
      const key = String(r.manga._id);
      const curr = candidateMap.get(key) || { manga: r.manga, content: 0, semantic: 0, collaborative: 0, popularity: 0, reason: [] };
      curr.collaborative += r.score;
      curr.reason.push("Users with similar ratings enjoyed this");
      candidateMap.set(key, curr);
    });

    const popularity = await popularityFallback(loggedMangaIds, 100);
    popularity.forEach((r) => {
      const key = String(r.manga._id);
      const curr = candidateMap.get(key) || { manga: r.manga, content: 0, semantic: 0, collaborative: 0, popularity: 0, reason: [] };
      curr.popularity += r.score;
      curr.reason.push("Hidden gem / community momentum");
      candidateMap.set(key, curr);
    });

    const ranked = normalizeScores(
      Array.from(candidateMap.values())
        .map((c) => ({
          manga: c.manga,
          score: 0.4 * c.content + 0.2 * c.semantic + 0.3 * c.collaborative + 0.1 * c.popularity,
          reasoning: Array.from(new Set(c.reason)).slice(0, 2).join(" • "),
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    );

    return {
      manga: ranked.map((r) => r.manga),
      scores: ranked.map((r) => ({ score: Number(r.score.toFixed(4)), confidence: r.confidence })),
      reasoning: ranked.map((r) => r.reasoning || "Based on your reading profile"),
    };
  });
}

async function getTrendingRecommendations(limit = 10) {
  return getOrSetCache("trending:global", "trending", null, 600, async () => {
    const rows = await Manga.aggregate([
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$reviewCount", 0.5] },
              { $multiply: ["$favoritesCount", 0.3] },
              { $multiply: ["$members", 0.00001] },
              { $multiply: ["$score", 1.2] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit },
    ]);

    return {
      manga: rows,
      scores: rows.map((r) => ({ score: r.trendingScore, confidence: Math.min(1, r.trendingScore / 100) })),
      reasoning: rows.map(() => "Trending from engagement, saves, and ratings"),
    };
  });
}

async function refreshEmbeddingsBatch(batchSize = 100) {
  const manga = await Manga.find({}).limit(batchSize);
  for (const row of manga) {
    await upsertEmbedding(row);
  }
  return { processed: manga.length };
}

module.exports = {
  getSimilarRecommendationsByMalId,
  getForUserRecommendations,
  getTrendingRecommendations,
  refreshEmbeddingsBatch,
};
