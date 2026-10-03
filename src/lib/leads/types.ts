export type SubmitLeadResult =
  | { ok: true; ref: string; total: number; surDevis: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
