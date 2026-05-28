const recommendationService = require("../services/recommendation/recommendationService");

let scheduler = null;

async function runEmbeddingRefresh() {
  try {
    const result = await recommendationService.refreshEmbeddingsBatch(200);
    console.log(`[embedding-job] Refreshed embeddings for ${result.processed} manga`);
  } catch (error) {
    console.error("[embedding-job] Failed:", error.message);
  }
}

function startEmbeddingScheduler() {
  const intervalMinutes = Number(process.env.EMBEDDING_REFRESH_INTERVAL_MINUTES || 60);
  if (scheduler) clearInterval(scheduler);

  if (process.env.ENABLE_EMBEDDING_JOBS === "false") {
    console.log("[embedding-job] Scheduler disabled by env flag");
    return;
  }

  runEmbeddingRefresh();
  scheduler = setInterval(runEmbeddingRefresh, intervalMinutes * 60 * 1000);
  console.log(`[embedding-job] Scheduler started (every ${intervalMinutes} min)`);
}

module.exports = {
  runEmbeddingRefresh,
  startEmbeddingScheduler,
};
