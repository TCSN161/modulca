# Tier 3: Vector DB Architecture — Deep AI Consultation

## Status: CHECKPOINT (not yet implemented)

This document describes the planned Tier 3 architecture for deep AI consultation
using vector embeddings and semantic search. This enables Architect-tier subscribers
to get answers that draw from the full depth of the knowledge library, not just
keyword-matched article snippets.

## Current Architecture (Tiers 1-2)

```
User question → keyword scoring → top N articles → inject into LLM prompt
```

| Tier | Articles | Context chars | Quality |
|------|----------|--------------|---------|
| Free | 2 | 2,000 | Good for basics |
| Premium | 4 | 6,000 | Good for specific questions |
| Architect | 6 | 12,000 | Good but keyword-limited |

**Limitation:** Keyword scoring misses semantic relationships. "What insulation works
best for cold climates?" won't reliably find the passive house article unless the
exact keywords match. Cross-domain questions (seismic + energy + cost) also suffer.

## Proposed Tier 3 Architecture

```
User question
  → Generate embedding (OpenAI ada-002 or Supabase pgvector)
  → Semantic search across all article chunks
  → Retrieve top 8-12 relevant chunks (may span multiple articles)
  → Re-rank by relevance + region context
  → Inject 12-16K tokens into LLM prompt
  → High-quality, cross-referenced answer
```

### Components

#### 1. Embedding Pipeline (build-time)

```
scripts/build-embeddings.mjs
  → Read all .md articles
  → Split into chunks (~500 tokens each, overlap 100 tokens)
  → Generate embeddings via OpenAI text-embedding-3-small
  → Store in Supabase pgvector table
```

**Chunking strategy:**
- Split on `## ` headers (natural section boundaries)
- Each chunk keeps metadata: article_id, title, category, region, section_header
- Overlap: last 2 sentences of previous chunk prepended to next
- Target: ~500 tokens per chunk → ~133 articles × ~3 chunks avg = ~400 chunks

#### 2. Supabase Table Schema

```sql
CREATE TABLE kb_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL,
  chunk_index INT NOT NULL,
  section_header TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- text-embedding-3-small dimension
  metadata JSONB,          -- { category, region, tags, difficulty }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON kb_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 20);  -- ~400 chunks → 20 lists is appropriate
```

#### 3. Search Function

```sql
CREATE OR REPLACE FUNCTION match_kb_chunks(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 8,
  filter_region TEXT DEFAULT NULL
)
RETURNS TABLE (
  article_id TEXT,
  section_header TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.article_id,
    e.section_header,
    e.content,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM kb_embeddings e
  WHERE
    (filter_region IS NULL OR e.metadata->>'region' = filter_region
     OR e.metadata->>'region' IS NULL)
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### 4. Route.ts Changes (Architect tier only)

```typescript
// In buildRAGContext(), when tier === "architect":
if (tier === "architect" && supabaseEnabled) {
  // Generate embedding for user question
  const embedding = await generateEmbedding(question);
  
  // Semantic search in Supabase
  const chunks = await supabase.rpc("match_kb_chunks", {
    query_embedding: embedding,
    match_count: 10,
    filter_region: detectedRegion,
  });
  
  // Build context from chunks (up to 16K tokens)
  return formatChunksAsContext(chunks.data);
}
// Otherwise, fall back to keyword scoring (Tiers 1-2)
```

### Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| OpenAI embeddings (build) | ~$0.01 per build | 400 chunks × 500 tokens = 200K tokens |
| Supabase pgvector | Free tier included | Up to 500MB storage |
| OpenAI embedding (query) | ~$0.00001 per query | Single question embedding |
| Supabase function call | Free tier included | RPC call |

**Total incremental cost:** ~$0.01 per knowledge rebuild + ~$0.00001 per query.
Effectively free at current scale.

### Implementation Steps

1. **Add Supabase pgvector extension** (if not already enabled)
2. **Create `kb_embeddings` table** via migration
3. **Write `scripts/build-embeddings.mjs`** — runs after `build-knowledge.mjs`
4. **Add `generateEmbedding()` utility** — calls OpenAI API
5. **Update `route.ts`** — semantic search branch for Architect tier
6. **Test with cross-domain questions** that keyword scoring misses
7. **Add rebuild trigger** — embeddings rebuild when articles change

### When to Implement

Implement when:
- Architect tier has paying subscribers (justifies OpenAI API key cost)
- Knowledge library exceeds ~200 articles (keyword scoring starts degrading)
- Users report poor answer quality for complex cross-domain questions

**Current priority: LOW** — keyword scoring works well for 133 articles. Revisit at 200+.

### Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Supabase pgvector** (chosen) | Already in stack, free tier, SQL familiar | Needs OpenAI key for embeddings |
| Pinecone | Managed, fast | Additional vendor, cost |
| ChromaDB | OSS, local | Needs server process |
| Weaviate | Full-featured | Overkill for ~400 chunks |
| TF-IDF (no embeddings) | No API needed | Worse semantic understanding |

Supabase pgvector wins because it's already in our stack and the scale is tiny.
