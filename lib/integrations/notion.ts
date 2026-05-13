import { Client } from '@notionhq/client';
import type { ClassifiedThought, IntegrationResult } from '@/lib/types';

/**
 * Notion: append a row to a configured database.
 *
 * Database schema expected (builder agent — create this in Notion first):
 *   - Title (title)
 *   - Type (select: task, note, research, message, code, calendar, reminder)
 *   - Tags (multi-select)
 *   - Source (rich_text) — set to "Archimedes"
 *   - Captured (date)
 *   - Body (rich_text)
 */
export async function dispatchNotion(c: ClassifiedThought): Promise<IntegrationResult> {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID;
  if (!apiKey || !dbId) {
    console.warn('[notion] missing NOTION_API_KEY / NOTION_DATABASE_ID — skipping');
    return { app: 'notion', ok: false, error: 'no-credentials' };
  }

  const notion = new Client({ auth: apiKey });

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Title: { title: [{ text: { content: c.payload.title } }] },
      Type: { select: { name: c.type } },
      Tags: { multi_select: (c.payload.tags ?? []).map((t) => ({ name: t })) },
      Source: { rich_text: [{ text: { content: 'Archimedes' } }] },
      Captured: { date: { start: new Date().toISOString() } },
      Body: { rich_text: [{ text: { content: c.payload.body ?? '' } }] }
    }
  });

  return { app: 'notion', ok: true, id: page.id, url: (page as any).url };
}
