import { InjectionToken } from '@angular/core';

/** Shape of `GET /config.json`, as served by the demo host. */
export interface DemoConfig {
  /** Origin the Supabase client talks to. Always this host: `/auth/v1` is proxied to gotrue. */
  readonly supabaseUrl: string;
  /** Public anon key. Never hard-coded here: it comes from the host at runtime. */
  readonly supabaseAnonKey: string;
}

export type DemoConfigState =
  | { readonly ok: true; readonly config: DemoConfig }
  | { readonly ok: false; readonly error: string };

/** Provided by `main.ts` after the config fetch settled, so no component sees a pending promise. */
export const DEMO_CONFIG = new InjectionToken<DemoConfigState>('DEMO_CONFIG');

const CONFIG_URL = '/config.json';
const CONFIG_TIMEOUT_MS = 5000;


/**
 * Reads `/config.json` before bootstrap. Never throws: a missing or broken config degrades to a
 * message so the gallery still renders (the components show their own errors when used).
 */
export async function loadConfig(): Promise<DemoConfigState> {
  try {
    const response = await fetch(CONFIG_URL, {
      credentials: 'include',
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(CONFIG_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { ok: false, error: `GET ${CONFIG_URL} respondeu HTTP ${response.status}.` };
    }

    const raw: unknown = await response.json();
    const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};

    const supabaseUrl = text(record['supabaseUrl']);
    const supabaseAnonKey = text(record['supabaseAnonKey']);

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        ok: false,
        error: `GET ${CONFIG_URL} não devolveu supabaseUrl e supabaseAnonKey utilizáveis.`,
      };
    }

    return { ok: true, config: { supabaseUrl, supabaseAnonKey } };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `GET ${CONFIG_URL} falhou: ${reason}` };
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
