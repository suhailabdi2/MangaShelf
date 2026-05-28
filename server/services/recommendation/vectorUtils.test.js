const test = require("node:test");
const assert = require("node:assert/strict");
const { cosineSimilarity, buildTfIdfVectors } = require("./vectorUtils");

test("cosine similarity returns 1 for same vectors", () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
});

test("tfidf creates one vector per document", () => {
  const vectors = buildTfIdfVectors(["action drama", "drama slice of life"]);
  assert.equal(vectors.length, 2);
  assert.ok(vectors[0].length > 0);
});
