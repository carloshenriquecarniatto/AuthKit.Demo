import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AuthKitEmailComponent,
  AuthKitMagicLinkComponent,
  AuthKitResetPasswordComponent,
  AuthKitSocialsComponent,
  type AuthError,
  type AuthMessageKey,
  type AuthSession,
  type SocialButtonVariant,
} from '@authkit/angular';
import { DEMO_CONFIG } from './config';
import { COMPONENT_DOCS } from './props-tables';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly state = inject(DEMO_CONFIG);

  readonly origin = window.location.origin;
  readonly redirectTo = `${window.location.origin}/angular/`;

  // Storybook frame mode: /angular/?story=email&prefilledEmail=… renders one component, no shell.
  private readonly storyParams = new URLSearchParams(window.location.search);
  readonly story = this.storyParams.get('story');

  // Configuration, as read from /config.json before bootstrap.
  readonly configOk = computed(() => this.state.ok);
  readonly configError = computed(() => (this.state.ok ? null : this.state.error));
  readonly supabaseUrl = computed(() => (this.state.ok ? this.state.config.supabaseUrl : '—'));
  readonly maskedAnonKey = computed(() =>
    this.state.ok ? mask(this.state.config.supabaseAnonKey) : '—',
  );
  readonly anonKeyLength = computed(() =>
    this.state.ok ? this.state.config.supabaseAnonKey.length : 0,
  );

  // Documentation tables.
  readonly docs = COMPONENT_DOCS;

  // Supabase gallery state.
  readonly tabs = TABS;
  readonly supabaseTab = signal<SupabaseTab>('email');
  readonly supabaseNotice = signal<string | null>(null);

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

  arg(name: string, fallback = ''): string {
    return this.storyParams.get(name) ?? fallback;
  }

  bool(name: string, fallback = false): boolean {
    const value = this.storyParams.get(name);
    return value === null ? fallback : value === 'true';
  }

  labels(): Partial<Record<AuthMessageKey, string>> {
    try {
      return JSON.parse(this.arg('labels', '{}')) as Partial<Record<AuthMessageKey, string>>;
    } catch {
      return {};
    }
  }

  storyProviders(): readonly string[] {
    return this.arg('providers', 'github,google')
      .split(',')
      .map((provider) => provider.trim())
      .filter((provider) => provider.length > 0);
  }

  storyVariant(): SocialButtonVariant {
    return this.arg('variant', 'icon-and-text') === 'icon' ? 'icon' : 'icon-and-text';
  }
}

/** Shows enough of the anon key to recognise it, never the whole value. */
function mask(value: string): string {
  if (value.length <= 12) {
    return '•'.repeat(8);
  }

  return `${value.slice(0, 6)}${'•'.repeat(12)}${value.slice(-4)}`;
}
