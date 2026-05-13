import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ClassifiedThought, Cluster, StoredThought } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CLASSIFIER_MODEL = process.env.CLASSIFIER_MODEL ?? 'gpt-4o-mini';

let cachedClassifierPrompt: string | null = null;
function classifierPrompt(): string {
  if (cachedClassifierPrompt) return cachedClassifierPrompt;
  cachedClassifierPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'router-classifier.md'),
    'utf-8'
  );
  return cachedClassifierPrompt;
}

let cachedDigestPrompt: string | null = null;
function digestPrompt(): string {
  if (cachedDigestPrompt) return cachedDigestPrompt;
  cachedDigestPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'resurfacing.md'),
    'utf-8'
  );
  return cachedDigestPrompt;
}

/**
 * Classify a captured thought into a structured intent.
 *
 * TODO (builder agent):
 *  - Switch to structured outputs (response_format: json_schema) once you've
 *    confirmed the model supports it.
 *  - Add a retry on JSON parse failure.
 */
export async function classifyThought(opts: {
  transcript: string;
  clarification?: string;
}): Promise<ClassifiedThought> {
  const now = new Date().toISOString();
  const tz = process.env.USER_TIMEZONE ?? 'UTC';

  const userMessage = [
    `current_datetime: ${now}`,
    `user_timezone: ${tz}`,
    `transcript: """${opts.transcript}"""`,
    opts.clarification ? `clarification: """${opts.clarification}"""` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: CLASSIFIER_MODEL,
    messages: [
      { role: 'system', content: classifierPrompt() },
      { role: 'user', content: userMessage }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as ClassifiedThought;
}

/**
 * Produce a spoken-style script for the morning digest.
 */
export async function generateDigestScript(opts: {
  thoughts: StoredThought[];
  clusters: Cluster[];
}): Promise<string> {
  const userMessage = JSON.stringify(
    {
      thoughts: opts.thoughts.map((t) => ({
        transcript: t.transcript,
        type: t.classification.type,
        target_app: t.classification.target_app,
        captured_at: t.captured_at,
        title: t.classification.payload.title
      })),
      clusters: opts.clusters
    },
    null,
    2
  );

  const completion = await openai.chat.completions.create({
    model: CLASSIFIER_MODEL,
    messages: [
      { role: 'system', content: digestPrompt() },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.6
  });

  return completion.choices[0]?.message?.content?.trim() ?? '';
}
