import type { AuthProvider, AuthResult, AuthSession, AuthStateChange } from '@authkit/angular';
import { authError, fail, next, ok } from '@authkit/angular';

/**
 * A deterministic provider for the stories: no network, no Supabase project. The components render
 * from `capabilities`, so this is enough to exercise every branch of the UI.
 */
export class StoryAuthProvider implements AuthProvider {
  readonly capabilities = {
    password: true,
    signUp: true,
    magicLink: true,
    emailOtp: true,
    phoneOtp: false,
    passwordRecovery: true,
    mfa: false,
    socialProviders: ['github', 'google'],
    federation: [],
  } as const;

  currentSession: AuthSession | null = null;

  private readonly listeners = new Set<(change: AuthStateChange) => void>();

  onStateChange(listener: (change: AuthStateChange) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    if (password.length < 8) {
      return fail(authError('weak_password', 'Use at least 8 characters.'));
    }

    return this.apply(email);
  }

  async signUpWithPassword(email: string, password: string): Promise<AuthResult> {
    return this.signInWithPassword(email, password);
  }

  async sendMagicLink(): Promise<AuthResult> {
    return next('confirm_email');
  }

  async sendPasswordReset(): Promise<AuthResult> {
    return { ok: true, session: null, error: null, nextStep: 'none' };
  }

  async updatePassword(): Promise<AuthResult> {
    return { ok: true, session: null, error: null, nextStep: 'none' };
  }

  async sendEmailOtp(): Promise<AuthResult> {
    return next('verify_otp');
  }

  async verifyEmailOtp(email: string): Promise<AuthResult> {
    return this.apply(email);
  }

  async sendPhoneOtp(): Promise<AuthResult> {
    return fail(authError('provider_disabled', 'Phone OTP is not enabled in this story.'));
  }

  async verifyPhoneOtp(): Promise<AuthResult> {
    return fail(authError('provider_disabled', 'Phone OTP is not enabled in this story.'));
  }

  async beginOAuth(provider: string): Promise<string> {
    return `https://example.invalid/oauth/${provider}`;
  }

  async completeOAuth(): Promise<AuthResult> {
    return fail(authError('provider_disabled', 'OAuth is not completed in this story.'));
  }

  async refreshSession(): Promise<AuthResult> {
    return this.currentSession
      ? ok(this.currentSession)
      : fail(authError('session_expired', 'No session.'));
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
    this.emit('idle', null);
  }

  private apply(email: string): AuthResult {
    const session: AuthSession = {
      accessToken: 'story-access-token',
      refreshToken: null,
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      tokenType: 'bearer',
      user: {
        id: 'story-user',
        email,
        phone: null,
        emailConfirmedAt: null,
        phoneConfirmedAt: null,
        displayName: email.split('@')[0] ?? 'Story user',
        metadata: {},
        identity: null,
      },
      provider: null,
    };

    this.currentSession = session;
    this.emit('authenticated', session);
    return ok(session);
  }

  private emit(state: AuthStateChange['state'], session: AuthSession | null): void {
    for (const listener of this.listeners) {
      listener({ state, session });
    }
  }
}
