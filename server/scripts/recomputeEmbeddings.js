require("dotenv").config();
const connectDB = require("../config/db");
const { refreshEmbeddingsBatch } = require("../services/recommendation/recommendationService");

async function main() {
  await connectDB();
  const result = await refreshEmbeddingsBatch(5000);
  console.log(`Processed embeddings for ${result.processed} manga`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Embedding refresh failed", error);
  process.exit(1);
});
