/**
 * Public host configuration.
 *
 * The app runs same-origin with the .NET host, so `/config.json` is fetched at
 * runtime and never bundled. Only the Cl@ve login path is used here; the
 * Supabase URL/key belong to the Angular and Blazor halves of the demo.
 */
export interface HostConfig {
  readonly claveLoginPath: string;
}

export const FALLBACK_HOST_CONFIG: HostConfig = Object.freeze({
  claveLoginPath: '/clave/login',
});

/** What the app knows before Aurelia starts, registered as a DI instance. */
export class DemoRuntime {
  constructor(
    readonly config: HostConfig,
    /** Non-null when `/config.json` could not be read and defaults were used. */
    readonly warning: string | null,
    readonly origin: string,
  ) {}

  get configured(): boolean {
    return this.warning === null;
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function asLoginPath(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.startsWith('/') ? trimmed : null;
}

/**
 * Never throws: a failed `/config.json` degrades to the host's default login
 * path so the page still renders and explains what happened.
 */
export async function loadDemoRuntime(): Promise<DemoRuntime> {
  const origin = window.location.origin;

  try {
    const response = await fetch('/config.json', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`GET /config.json respondeu HTTP ${response.status}`);
    }

    const body: unknown = await response.json();
    const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const loginPath = asLoginPath(record['claveLoginPath']);
    if (loginPath === null) {
      throw new Error('a resposta não trouxe um claveLoginPath que comece por "/"');
    }

    return new DemoRuntime({ claveLoginPath: loginPath }, null, origin);
  } catch (error) {
    return new DemoRuntime(
      FALLBACK_HOST_CONFIG,
      `Não foi possível ler /config.json (${describe(error)}). A demo arranca com ` +
        `claveLoginPath="${FALLBACK_HOST_CONFIG.claveLoginPath}"; os botões Cl@ve só funcionam ` +
        'se o host expuser esse caminho.',
      origin,
    );
  }
}
