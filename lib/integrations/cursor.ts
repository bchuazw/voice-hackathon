import { appendFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { ClassifiedThought, IntegrationResult } from '@/lib/types';

/**
 * Cursor integration — the sponsor-delight one.
 *
 * For each code thought, append a checkbox line to `.cursor/todos.md` in
 * the configured target repo. Optionally include a structured note that
 * Cursor's agent can pick up.
 *
 * TODO (builder agent):
 *  - If CURSOR_TARGET_REPO_URL is set instead of a local path, use the GitHub
 *    CLI (`gh issue create` or `gh api`) to file an issue on the repo.
 *  - Add option to open a Cursor agent session via the Cursor CLI when
 *    Cursor exposes one (track https://docs.cursor.com for updates).
 */
export async function dispatchCursor(c: ClassifiedThought): Promise<IntegrationResult> {
  const repoPath = process.env.CURSOR_TARGET_REPO_PATH;
  if (!repoPath) {
    console.warn('[cursor] CURSOR_TARGET_REPO_PATH not set — skipping');
    return { app: 'cursor', ok: false, error: 'no-target-repo' };
  }

  const file = join(repoPath, '.cursor', 'todos.md');
  await mkdir(dirname(file), { recursive: true });

  const captured = new Date().toISOString().slice(0, 10);
  const line = `- [ ] ${c.payload.title}${c.payload.body ? ` — ${c.payload.body}` : ''} (captured ${captured} via Archimedes)\n`;

  await appendFile(file, line, 'utf-8');
  return { app: 'cursor', ok: true, url: `file://${file}` };
}
