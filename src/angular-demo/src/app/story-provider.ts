import {
  authError,
  fail,
  next,
  ok,
  type AuthProvider,
  type AuthResult,
  type AuthSession,
  type AuthStateChange,
} from '@authkit/angular';

/**
 * Deterministic in-memory provider used by the Storybook frames on the documentation site.
 * No network, no Supabase project: the components render from `capabilities` and the result
 * branches they declare. The live demo keeps using the real Supabase provider.
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
    return next('none');
  }

  async updatePassword(): Promise<AuthResult> {
    return next('none');
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
