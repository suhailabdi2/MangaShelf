function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildTfIdfVectors(documents) {
  const docTokens = documents.map(tokenize);
  const terms = new Set();
  docTokens.forEach((tokens) => tokens.forEach((t) => terms.add(t)));
  const vocab = Array.from(terms);
  const termIndex = new Map(vocab.map((term, idx) => [term, idx]));
  const docCount = documents.length;

  const docFreq = new Array(vocab.length).fill(0);
  docTokens.forEach((tokens) => {
    const seen = new Set(tokens);
    seen.forEach((term) => {
      const idx = termIndex.get(term);
      if (idx !== undefined) docFreq[idx] += 1;
    });
  });

  return docTokens.map((tokens) => {
    const vec = new Array(vocab.length).fill(0);
    const counts = {};
    tokens.forEach((term) => {
      counts[term] = (counts[term] || 0) + 1;
    });
    const tokenCount = tokens.length || 1;
    Object.entries(counts).forEach(([term, count]) => {
      const idx = termIndex.get(term);
      if (idx === undefined) return;
      const tf = count / tokenCount;
      const idf = Math.log((1 + docCount) / (1 + docFreq[idx])) + 1;
      vec[idx] = tf * idf;
    });
    return vec;
  });
}

module.exports = {
  tokenize,
  cosineSimilarity,
  buildTfIdfVectors,
};
