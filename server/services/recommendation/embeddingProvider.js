const crypto = require("crypto");
const axios = require("axios");

const LOCAL_DIMENSION = 256;

function buildEmbeddingText(manga) {
  return [
    manga.mangaTitle,
    manga.synopsis,
    (manga.genres || []).join(" "),
    (manga.tags || []).join(" "),
    (manga.themes || []).join(" "),
    (manga.demographics || []).join(" "),
    manga.author,
  ]
    .filter(Boolean)
    .join(" ");
}

function localHashEmbedding(text, dimension = LOCAL_DIMENSION) {
  const vec = new Array(dimension).fill(0);
  const tokens = String(text || "").toLowerCase().split(/\s+/).filter(Boolean);
  tokens.forEach((token) => {
    const hash = crypto.createHash("sha256").update(token).digest();
    for (let i = 0; i < 8; i += 1) {
      const idx = hash.readUInt16BE((i * 2) % 30) % dimension;
      const sign = hash[(i + 8) % hash.length] % 2 === 0 ? 1 : -1;
      vec[idx] += sign * (1 / Math.sqrt(tokens.length || 1));
    }
  });
  return vec;
}

async function generateEmbeddingForText(text) {
  if (process.env.OPENAI_API_KEY) {
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      provider: "openai",
      vector: response.data.data?.[0]?.embedding || [],
    };
  }

  return {
    provider: "local-hash-v1",
    vector: localHashEmbedding(text),
  };
}

module.exports = {
  buildEmbeddingText,
  generateEmbeddingForText,
};
