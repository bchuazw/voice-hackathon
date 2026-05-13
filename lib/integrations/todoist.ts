import type { ClassifiedThought, IntegrationResult } from '@/lib/types';

/**
 * Todoist REST v2: POST https://api.todoist.com/rest/v2/tasks
 * Docs: https://developer.todoist.com/rest/v2/
 *
 * This is the easiest integration to demo — start here.
 */
export async function dispatchTodoist(c: ClassifiedThought): Promise<IntegrationResult> {
  const token = process.env.TODOIST_API_TOKEN;
  if (!token) {
    console.warn('[todoist] TODOIST_API_TOKEN not set — skipping');
    return { app: 'todoist', ok: false, error: 'no-token' };
  }

  const body = {
    content: c.payload.title,
    description: c.payload.body ?? undefined,
    due_datetime: c.payload.due_at ?? undefined,
    labels: c.payload.tags
  };

  const res = await fetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    return { app: 'todoist', ok: false, error: `${res.status} ${text}` };
  }

  const data = (await res.json()) as { id: string; url: string };
  return { app: 'todoist', ok: true, id: data.id, url: data.url };
}
