import { google } from 'googleapis';
import type { ClassifiedThought, IntegrationResult } from '@/lib/types';

/**
 * Google Calendar v3 — POST /calendar/v3/calendars/{calendarId}/events
 * Auth via OAuth2 refresh token.
 *
 * One-time setup (builder agent):
 *   1. Create OAuth client at https://console.cloud.google.com (web app)
 *   2. Use OAuth Playground or a quick local flow to get a refresh token for scope:
 *      https://www.googleapis.com/auth/calendar.events
 *   3. Paste into .env.local as GOOGLE_REFRESH_TOKEN
 */
export async function dispatchCalendar(c: ClassifiedThought): Promise<IntegrationResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[calendar] missing Google OAuth env vars — skipping');
    return { app: 'calendar', ok: false, error: 'no-oauth' };
  }

  const oauth = new google.auth.OAuth2(clientId, clientSecret);
  oauth.setCredentials({ refresh_token: refreshToken });
  const cal = google.calendar({ version: 'v3', auth: oauth });

  // If no due_at, default to 09:00 tomorrow.
  const start = c.payload.due_at ?? nextDayAt9().toISOString();
  const end = new Date(new Date(start).getTime() + 30 * 60_000).toISOString();

  const event = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: c.payload.title,
      description: [c.payload.body, c.payload.tags?.length ? `tags: ${c.payload.tags.join(', ')}` : '']
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: start },
      end: { dateTime: end }
    }
  });

  return {
    app: 'calendar',
    ok: true,
    id: event.data.id ?? undefined,
    url: event.data.htmlLink ?? undefined
  };
}

function nextDayAt9(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}
