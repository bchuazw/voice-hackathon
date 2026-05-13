import type { ClassifiedThought, IntegrationResult } from '@/lib/types';
import { dispatchTodoist } from './todoist';
import { dispatchCalendar } from './calendar';
import { dispatchNotion } from './notion';
import { dispatchCursor } from './cursor';

/**
 * Route a classified thought to the matching integration. Never throws —
 * adapters log errors and return ok=false so the voice loop keeps moving.
 */
export async function dispatch(c: ClassifiedThought): Promise<IntegrationResult> {
  try {
    switch (c.target_app) {
      case 'todoist':
        return await dispatchTodoist(c);
      case 'calendar':
        return await dispatchCalendar(c);
      case 'notion':
        return await dispatchNotion(c);
      case 'cursor':
        return await dispatchCursor(c);
      case 'reminders':
        // iOS Reminders has no public API. Fall back to Todoist with a tag.
        return await dispatchTodoist({ ...c, payload: { ...c.payload, tags: [...c.payload.tags, 'reminder'] } });
      case 'imessage':
        // No public API. Fall back to Notion with a "to-send" tag.
        return await dispatchNotion({ ...c, payload: { ...c.payload, tags: [...c.payload.tags, 'to-send'] } });
      default:
        return { app: c.target_app, ok: false, error: 'unknown target_app' };
    }
  } catch (err: any) {
    console.error(`[dispatch:${c.target_app}]`, err);
    return { app: c.target_app, ok: false, error: err?.message ?? String(err) };
  }
}
