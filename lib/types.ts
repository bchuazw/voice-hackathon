export type ThoughtType = 'task' | 'calendar' | 'note' | 'reminder' | 'message' | 'code' | 'research';
export type TargetApp = 'todoist' | 'calendar' | 'notion' | 'reminders' | 'imessage' | 'cursor';

export type ClassifiedThought = {
  type: ThoughtType;
  target_app: TargetApp;
  payload: {
    title: string;
    body: string | null;
    due_at: string | null;
    tags: string[];
    target_repo: string | null;
    target_person: string | null;
  };
  confidence: number;
  rationale: string;
};

export type StoredThought = {
  id: string;
  user_id: string;
  transcript: string;
  classification: ClassifiedThought;
  integration_result: IntegrationResult | null;
  captured_at: string;
  resurfaced_at: string | null;
  embedding?: number[] | null;
};

export type IntegrationResult = {
  app: TargetApp;
  ok: boolean;
  url?: string;
  id?: string;
  error?: string;
};

export type Cluster = {
  theme: string;
  thought_ids: string[];
  span_days: number;
};
