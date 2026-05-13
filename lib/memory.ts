import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Cluster, ClassifiedThought, IntegrationResult, StoredThought } from './types';

const SIMILARITY_THRESHOLD = Number(process.env.CLUSTER_SIMILARITY_THRESHOLD ?? '0.82');
const MIN_CLUSTER_SIZE = Number(process.env.MIN_CLUSTER_SIZE ?? '3');

let _supabase: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY');
  }
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return res.data[0].embedding;
}

export async function saveThought(opts: {
  transcript: string;
  classification: ClassifiedThought;
  integration_result: IntegrationResult | null;
  conversation_id: string | null;
}): Promise<void> {
  try {
    const embedding = await embed(opts.transcript).catch(() => null);
    const { error } = await supabase()
      .from('thoughts')
      .insert({
        user_id: 'demo',
        transcript: opts.transcript,
        classification: opts.classification,
        integration_result: opts.integration_result,
        conversation_id: opts.conversation_id,
        embedding
      });
    if (error) console.error('[memory.saveThought] supabase error', error);
  } catch (err) {
    console.error('[memory.saveThought] threw', err);
  }
}

export async function fetchThoughtsSince(hours: number): Promise<StoredThought[]> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const { data, error } = await supabase()
    .from('thoughts')
    .select('*')
    .gte('captured_at', since)
    .order('captured_at', { ascending: true });
  if (error) {
    console.error('[memory.fetchThoughtsSince]', error);
    return [];
  }
  return (data ?? []) as StoredThought[];
}

/**
 * Naive clustering using cosine similarity.
 *
 * TODO (builder agent):
 *  - Push this to Postgres via pgvector for scale.
 *  - For the demo, in-memory is fine — we'll have <100 thoughts.
 */
export async function findClusters(thoughts: StoredThought[]): Promise<Cluster[]> {
  const withEmbeddings = thoughts.filter((t) => Array.isArray(t.embedding) && t.embedding!.length > 0);
  if (withEmbeddings.length < MIN_CLUSTER_SIZE) return [];

  const visited = new Set<string>();
  const clusters: Cluster[] = [];

  for (const seed of withEmbeddings) {
    if (visited.has(seed.id)) continue;
    const group = [seed];
    visited.add(seed.id);
    for (const other of withEmbeddings) {
      if (visited.has(other.id)) continue;
      const sim = cosine(seed.embedding!, other.embedding!);
      if (sim >= SIMILARITY_THRESHOLD) {
        group.push(other);
        visited.add(other.id);
      }
    }
    if (group.length >= MIN_CLUSTER_SIZE) {
      const days = new Set(group.map((g) => g.captured_at.slice(0, 10)));
      clusters.push({
        theme: group[0].classification.payload.title,
        thought_ids: group.map((g) => g.id),
        span_days: days.size
      });
    }
  }

  return clusters;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}
