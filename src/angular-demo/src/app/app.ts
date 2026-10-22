import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AuthKitClaveCallbackComponent,
  AuthKitClaveComponent,
  AuthKitEmailComponent,
  AuthKitMagicLinkComponent,
  AuthKitResetPasswordComponent,
  AuthKitSocialsComponent,
  type AuthError,
  type AuthKitFederationOutcome,
  type AuthSession,
} from '@authkit/angular';
import { CLAVE_LEVEL_LABELS, CLAVE_PROVIDERS } from './clave-descriptors';
import { DEMO_CONFIG } from './config';
import { COMPONENT_DOCS } from './props-tables';
import { fetchSession, postLogout, type HostSession } from './session';

type SupabaseTab = 'email' | 'magic' | 'reset' | 'socials';

const TABS: readonly { readonly id: SupabaseTab; readonly label: string }[] = [
  { id: 'email', label: 'E-mail' },
  { id: 'magic', label: 'Magic link' },
  { id: 'reset', label: 'Recuperação' },
  { id: 'socials', label: 'Sociais' },
];

@Component({
  selector: 'app-root',
  imports: [
    AuthKitEmailComponent,
    AuthKitMagicLinkComponent,
    AuthKitResetPasswordComponent,
    AuthKitSocialsComponent,
    AuthKitClaveComponent,
    AuthKitClaveCallbackComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly state = inject(DEMO_CONFIG);

  readonly origin = window.location.origin;
  readonly redirectTo = `${window.location.origin}/angular/`;

  // Configuration, as read from /config.json before bootstrap.
  readonly configOk = computed(() => this.state.ok);
  readonly configError = computed(() => (this.state.ok ? null : this.state.error));
  readonly supabaseUrl = computed(() => (this.state.ok ? this.state.config.supabaseUrl : '—'));
  readonly claveLoginPath = computed(() =>
    this.state.ok ? this.state.config.claveLoginPath : '/clave/login',
  );
  readonly maskedAnonKey = computed(() =>
    this.state.ok ? mask(this.state.config.supabaseAnonKey) : '—',
  );
  readonly anonKeyLength = computed(() =>
    this.state.ok ? this.state.config.supabaseAnonKey.length : 0,
  );

  // Cl@ve descriptors and the labels the contract does not carry yet.
  readonly claveProviders = CLAVE_PROVIDERS;
  readonly levelLabels = CLAVE_LEVEL_LABELS;

  // Documentation tables.
  readonly docs = COMPONENT_DOCS;

  // Host session.
  readonly session = signal<HostSession | null>(null);
  readonly sessionLoading = signal(true);
  readonly sessionError = signal<string | null>(null);
  readonly loggingOut = signal(false);
  readonly isAuthenticated = computed(() => this.session()?.authenticated === true);

  // Supabase gallery state.
  readonly tabs = TABS;
  readonly supabaseTab = signal<SupabaseTab>('email');
  readonly supabaseNotice = signal<string | null>(null);

  // Cl@ve gallery state.
  readonly lastNavigation = signal<string | null>(null);
  readonly callbackOutcome = signal<AuthKitFederationOutcome | null>(null);

  /**
   * `<ak-clave-callback>` is mounted only when the URL actually carries federation parameters.
   * Rendering it on every page load would report `ok: true` for a URL that is not a callback.
   * It works without a router (it injects DOCUMENT, not Router), so this is a semantic choice,
   * not a technical limitation.
   */
  readonly hasFederationParams: boolean = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('error') || params.has('error_reason');
  })();

  constructor() {
    void this.refreshSession();
  }

  async refreshSession(): Promise<void> {
    this.sessionLoading.set(true);

    try {
      this.session.set(await fetchSession());
      this.sessionError.set(null);
    } catch (error) {
      this.session.set(null);
      this.sessionError.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.sessionLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    this.loggingOut.set(true);

    try {
      const ok = await postLogout();

      if (ok) {
        this.session.set({ authenticated: false });
        return;
      }

      // The host currently maps GET /logout only: a top-level navigation is the honest fallback.
      window.location.assign('/logout');
    } finally {
      this.loggingOut.set(false);
    }
  }

  go(url: string): void {
    this.lastNavigation.set(url);
    window.location.assign(url);
  }

  onCallbackCompleted(outcome: AuthKitFederationOutcome): void {
    this.callbackOutcome.set(outcome);
  }

  onSignedIn(session: AuthSession): void {
    this.supabaseNotice.set(
      `Sessão Supabase iniciada (${session.user.email ?? session.user.id}), expira em ${session.expiresAt}.`,
    );
  }

  onSignedUp(): void {
    this.supabaseNotice.set(
      'Pedido de sign-up aceite. Se o gotrue exigir confirmação, nenhuma sessão é devolvida.',
    );
  }

  onMagicLinkSent(): void {
    this.supabaseNotice.set('O provider aceitou o pedido de magic link.');
  }

  onResetRequested(): void {
    this.supabaseNotice.set('E-mail de recuperação aceite pelo provider.');
  }

  onFailed(error: AuthError | null): void {
    this.supabaseNotice.set(error ? `Falhou: ${error.message} (${error.code}).` : null);
  }

  acrLabel(acr: string | undefined): string {
    if (!acr) {
      return '—';
    }

    const match = /LoA\/(low|substantial|high)$/i.exec(acr);
    return match ? match[1] : acr;
  }
}

/** Shows enough of the anon key to recognise it, never the whole value. */
function mask(value: string): string {
  if (value.length <= 12) {
    return '•'.repeat(8);
  }

  return `${value.slice(0, 6)}${'•'.repeat(12)}${value.slice(-4)}`;
}
