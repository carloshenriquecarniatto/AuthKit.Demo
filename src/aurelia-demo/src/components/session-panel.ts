import { CustomElement } from 'aurelia';
import {
  AuthKitConfig,
  callbackUrlWithoutOutcome,
  IAuthKitClient,
  type AuthSession,
} from '@authkit/aurelia2';
import template from './session-panel.html?raw';
import { CLAVE_PROVIDER } from '../descriptors';
import { describeError, toAuthSession, type HostSessionPayload } from '../session-mapping';

interface FactRow {
  readonly label: string;
  readonly value: string;
  readonly mono: boolean;
}

type Status = 'loading' | 'ready' | 'error';

const DASH = '—';

function text(value: string | null | undefined): string {
  return value === null || value === undefined || value.trim().length === 0 ? DASH : value;
}

/** Claims the host exposes on `GET /session`, in display order. */
function hostFacts(payload: HostSessionPayload): FactRow[] {
  return [
    { label: 'Nome', value: text(payload.name), mono: false },
    { label: 'acr', value: text(payload.acr), mono: true },
    { label: 'amr', value: text(payload.amr), mono: true },
    { label: 'provider (host)', value: text(payload.provider), mono: true },
    { label: 'tenant', value: text(payload.tenant), mono: false },
    { label: 'documento', value: text(payload.docType), mono: false },
    { label: 'subject', value: text(payload.sub), mono: true },
  ];
}

/**
 * Shows the host session, not the SDK's own invention.
 *
 * `IAuthKitClient.session` is `@observable`, but the SDK never calls the host:
 * this component is the host adapter. It fetches `/session`, maps the claims
 * onto the contract (demo-only mapping) and pushes the result with
 * `client.setSession(...)`.
 */
export class SessionPanel {
  static inject = [IAuthKitClient, AuthKitConfig];

  readonly auth: IAuthKitClient;
  private readonly config: AuthKitConfig;

  status: Status = 'loading';
  signedIn = false;
  facts: FactRow[] = [];
  mirrorRows: FactRow[] = [];
  error: string | null = null;
  notice: string | null = null;
  busy = false;

  constructor(auth: IAuthKitClient, config: AuthKitConfig) {
    this.auth = auth;
    this.config = config;
  }

  attached(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.status = 'loading';
    const callbackError = this.readCallbackOutcome();
    this.error = callbackError;

    try {
      const response = await fetch('/session', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`GET /session respondeu HTTP ${response.status}`);
      }

      const payload = (await response.json()) as HostSessionPayload;
      this.apply(payload);
      this.status = 'ready';
    } catch (error) {
      this.status = 'error';
      const message = `Não foi possível ler /session: ${describeError(error)}`;
      this.error = this.error === null ? message : `${this.error} · ${message}`;
      this.signedIn = false;
      this.facts = [];
      this.mirrorRows = [];
    }
  }

  /**
   * POST is what a sign-out endpoint should accept; the .NET demo host only
   * maps `GET /logout`, so 404/405 falls back to the GET the host does serve.
   * The fallback is reported instead of being silent, and the outcome is read
   * from `/session` — the status of the redirect target is not the truth.
   */
  async logout(): Promise<void> {
    this.busy = true;
    this.error = null;
    this.notice = null;

    try {
      const post = await fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin',
        redirect: 'follow',
      });

      if (post.status === 404 || post.status === 405) {
        const get = await fetch('/logout', {
          method: 'GET',
          credentials: 'same-origin',
          redirect: 'follow',
        });
        if (get.status >= 500) {
          throw new Error(`POST /logout → HTTP ${post.status}; GET /logout → HTTP ${get.status}`);
        }
        this.notice =
          `O host respondeu HTTP ${post.status} a POST /logout; foi usado GET /logout como ` +
          'fallback (o host da demo só mapeia GET).';
      }

      await this.auth.signOut();
      await this.refresh();

      if (this.signedIn) {
        this.error = 'O host aceitou o pedido de logout, mas /session continua autenticado.';
      }
    } catch (error) {
      this.error = `Falha ao terminar sessão: ${describeError(error)}`;
    } finally {
      this.busy = false;
    }
  }

  private apply(payload: HostSessionPayload): void {
    this.signedIn = payload.authenticated === true;
    this.facts = this.signedIn ? hostFacts(payload) : [];

    this.auth.setSession(
      toAuthSession(payload, {
        audience: this.config.audience,
        provider: {
          id: CLAVE_PROVIDER.id,
          kind: CLAVE_PROVIDER.kind,
          displayName: CLAVE_PROVIDER.displayName,
        },
      }),
    );

    this.mirrorRows = this.mirrorOf(this.auth.session);
  }

  private mirrorOf(session: AuthSession | null): FactRow[] {
    if (session === null) {
      return [];
    }

    const identity = session.user.identity;
    return [
      { label: 'isAuthenticated', value: 'true', mono: true },
      { label: 'user.id (sub)', value: text(session.user.id), mono: true },
      { label: 'provider.ref', value: text(session.provider?.ref), mono: true },
      { label: 'loa', value: text(session.user.identity?.level), mono: true },
      { label: 'identity.method', value: text(identity?.method), mono: true },
      {
        label: 'accessToken',
        value: session.accessToken === '' ? '(vazio — sessão por cookie)' : '(presente)',
        mono: true,
      },
    ];
  }

  /**
   * After the federation redirect the host may append `?error=` /
   * `?error_reason=`. `completeFederation` is called only in that case, because
   * with no session it would report `identity_not_verified` on every anonymous
   * visit.
   */
  private readCallbackOutcome(): string | null {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('error') && !url.searchParams.has('error_reason')) {
      return null;
    }

    const result = this.auth.completeFederation(window.location.href);
    window.history.replaceState(
      {},
      '',
      callbackUrlWithoutOutcome(window.location.href, this.config.baseUrl),
    );

    return result.ok || result.error === null
      ? null
      : `${result.error.code} — ${result.error.message}`;
  }
}

export const SessionPanelElement = CustomElement.define(
  { name: 'ak-session-panel', template },
  SessionPanel,
);
