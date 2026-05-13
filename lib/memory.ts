import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Cluster, ClassifiedThought, IntegrationResult, StoredThought } from './types';

const SIMILARITY_THRESHOLD = Number(process.env.CLUSTER_SIMILARITY_THRESHOLD ?? '0.82');
const MIN_CLUSTER_SIZE = Number(process.env.MIN_CLUSTER_SIZE ?? '3');

let _supabase: SupabaseClient | null | false = null; // false = decided unavailable
function supabase(): SupabaseClient | null {
  if (_supabase === false) return null;
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    _supabase = false;
    return null;
  }
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

function openaiOrNull(): OpenAI | null {
  return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
}

async function embed(text: string): Promise<number[] | null> {
  const o = openaiOrNull();
  if (!o) return null;
  try {
    const res = await o.embeddings.create({ model: 'text-embedding-3-small', input: text });
    return res.data[0].embedding;
  } catch (err) {
    console.warn('[memory.embed] failed', err);
    return null;
  }
}

// In-process fallback store. Survives the lifetime of the dev server / serverless
// instance. Good enough for a single-user demo when Supabase isn't configured.
type MemoryRow = StoredThought;
const memStore: { rows: MemoryRow[] } = (globalThis as any).__archimedesMem ??
  ((globalThis as any).__archimedesMem = { rows: [] });

function nowIso() {
  return new Date().toISOString();
}

function randomId() {
  // crypto.randomUUID is available on Node 19+ and modern Edge runtimes.
  return (globalThis as any).crypto?.randomUUID?.() ?? `mem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function saveThought(opts: {
  transcript: string;
  classification: ClassifiedThought;
  integration_result: IntegrationResult | null;
  conversation_id: string | null;
}): Promise<StoredThought> {
  const embedding = await embed(opts.transcript);
  const row: StoredThought = {
    id: randomId(),
    user_id: 'demo',
    transcript: opts.transcript,
    classification: opts.classification,
    integration_result: opts.integration_result,
    captured_at: nowIso(),
    resurfaced_at: null,
    embedding: embedding ?? null
  };

  const sb = supabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('thoughts')
        .insert({
          user_id: 'demo',
          transcript: opts.transcript,
          classification: opts.classification,
          integration_result: opts.integration_result,
          conversation_id: opts.conversation_id,
          embedding
        })
        .select('*')
        .single();
      if (error) {
        console.error('[memory.saveThought] supabase error, falling back to memory', error);
      } else if (data) {
        return data as StoredThought;
      }
    } catch (err) {
      console.error('[memory.saveThought] threw, falling back to memory', err);
    }
  }

  memStore.rows.push(row);
  return row;
}

export async function fetchThoughtsSince(hours: number): Promise<StoredThought[]> {
  const sinceMs = Date.now() - hours * 3600_000;
  const since = new Date(sinceMs).toISOString();

  const sb = supabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('thoughts')
        .select('*')
        .gte('captured_at', since)
        .order('captured_at', { ascending: true });
      if (!error && data) return data as StoredThought[];
      if (error) console.error('[memory.fetchThoughtsSince] supabase error', error);
    } catch (err) {
      console.error('[memory.fetchThoughtsSince] threw', err);
    }
  }

  return memStore.rows
    .filter((r) => new Date(r.captured_at).getTime() >= sinceMs)
    .sort((a, b) => a.captured_at.localeCompare(b.captured_at));
}

export async function fetchRecent(limit = 25): Promise<StoredThought[]> {
  const sb = supabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('thoughts')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data as StoredThought[];
    } catch (err) {
      console.error('[memory.fetchRecent] threw', err);
    }
  }
  return memStore.rows.slice(-limit).reverse();
}

export function resetMemoryStore(): void {
  memStore.rows = [];
}

export function memoryBackend(): 'supabase' | 'in-memory' {
  return supabase() ? 'supabase' : 'in-memory';
}

/**
 * Naive in-memory clustering using cosine similarity over embeddings.
 * Skips entries without embeddings (e.g. when OPENAI_API_KEY isn't set).
 */
export async function findClusters(thoughts: StoredThought[]): Promise<Cluster[]> {
  const withEmbeddings = thoughts.filter((t) => Array.isArray(t.embedding) && t.embedding!.length > 0);
  if (withEmbeddings.length < MIN_CLUSTER_SIZE) return tagClusters(thoughts);

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
  // If embedding-based clustering found nothing actionable, fall back to tag overlap.
  return clusters.length > 0 ? clusters : tagClusters(thoughts);
}

/** Fallback heuristic: 3+ thoughts that share at least one tag form a cluster. */
function tagClusters(thoughts: StoredThought[]): Cluster[] {
  const buckets = new Map<string, StoredThought[]>();
  for (const t of thoughts) {
    for (const tag of t.classification.payload.tags ?? []) {
      const k = tag.toLowerCase();
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(t);
    }
  }
  const clusters: Cluster[] = [];
  for (const [tag, group] of buckets) {
    if (group.length >= MIN_CLUSTER_SIZE) {
      const days = new Set(group.map((g) => g.captured_at.slice(0, 10)));
      clusters.push({
        theme: tag,
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
