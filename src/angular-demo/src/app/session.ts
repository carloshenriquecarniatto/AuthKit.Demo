/** `GET /session` — the host's cookie session, not the Supabase session. */
export interface HostSession {
  readonly authenticated: boolean;
  readonly sub?: string;
  readonly name?: string;
  /** eIDAS level of assurance URI, for example `http://eidas.europa.eu/LoA/substantial`. */
  readonly acr?: string;
  /** Authentication method, for example `clave_movil`. */
  readonly amr?: string;
  /** Canonical provider reference, for example `demo/clave`. */
  readonly provider?: string;
  readonly tenant?: string;
  readonly docType?: string;
}

export async function fetchSession(): Promise<HostSession> {
  const response = await fetch('/session', {
    credentials: 'include',
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`GET /session respondeu HTTP ${response.status}`);
  }

  return (await response.json()) as HostSession;
}

/**
 * POST `/logout`. Returns false when the host does not accept POST on that route, so the caller
 * can fall back to a top-level navigation (see README, "Desvios").
 */
export async function postLogout(): Promise<boolean> {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'include',
      redirect: 'follow',
      headers: { accept: 'text/html' },
    });

    return response.ok;
  } catch {
    return false;
  }
}
