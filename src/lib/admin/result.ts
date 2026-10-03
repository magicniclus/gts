export type ActionResult<T = void> =
  | { ok: true; savedAt: string; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
