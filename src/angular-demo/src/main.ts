import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  authKitInterceptor,
  provideAuthKit,
  provideAuthKitMessagesFromUrl,
  provideAuthKitSupabase,
  type AuthKitUiOptions,
} from '@authkit/angular';
import { App } from './app/app';
import { loadConfig, DEMO_CONFIG } from './app/config';
import { DisabledAuthProvider } from './app/disabled-provider';

/** Providers offered by the local gotrue. Empty in the stack means the buttons report an error. */
const SOCIAL_PROVIDERS: readonly string[] = ['github', 'google'];

/**
 * `window.location.origin` is the host, not supersite: the Supabase client must hit `/auth/v1` on
 * the same origin so the host proxies it to gotrue and no CORS is involved.
 */
const REDIRECT_TO = `${window.location.origin}/angular/`;

const UI: AuthKitUiOptions = {
  theme: {
    primary: '#0b5cad',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#d1d5db',
    danger: '#b91c1c',
    radius: '10px',
    spacing: '16px',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    logoUrl: null,
  },
  socialProviders: SOCIAL_PROVIDERS,
};

async function bootstrap(): Promise<void> {
  const state = await loadConfig();

  const authProviders = state.ok
    ? [
        provideAuthKitSupabase(
          {
            url: state.config.supabaseUrl,
            anonKey: state.config.supabaseAnonKey,
            redirectTo: REDIRECT_TO,
            socialProviders: SOCIAL_PROVIDERS,
          },
          UI,
        ),
      ]
    : [
        // Still a valid AUTH_PROVIDER, so the gallery renders and explains itself instead of
        // failing with a NullInjectorError inside every component.
        provideAuthKit(
          new DisabledAuthProvider(
            `Configuração indisponível (${state.error}). Sem /config.json o provider Supabase não pode ser criado.`,
          ),
          UI,
        ),
      ];

  await bootstrapApplication(App, {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideAuthKitMessagesFromUrl('/pt.json'),
      provideHttpClient(withInterceptors([authKitInterceptor])),
      { provide: DEMO_CONFIG, useValue: state },
      ...authProviders,
    ],
  });
}

bootstrap().catch((error: unknown) => {
  console.error('AuthKit demo: bootstrap failed', error);
});
