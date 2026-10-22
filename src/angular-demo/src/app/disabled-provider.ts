import type {
  AuthCapabilities,
  AuthProvider,
  AuthResult,
  AuthSession,
} from '@authkit/angular';

const NO_CAPABILITIES: AuthCapabilities = {
  password: false,
  signUp: false,
  magicLink: false,
  emailOtp: false,
  phoneOtp: false,
  passwordRecovery: false,
  mfa: false,
  socialProviders: [],
  federation: [],
};

/**
 * Stand-in provider used when `/config.json` cannot be read.
 *
 * The components inject `AUTH_PROVIDER` in their constructors, so a missing provider is a
 * `NullInjectorError` and the page would not render at all. This provider keeps the injection
 * graph valid and answers every call with the same clear message, which the components then show
 * through their own `errorMessage` slot.
 */
export class DisabledAuthProvider implements AuthProvider {
  readonly capabilities = NO_CAPABILITIES;
  readonly currentSession: AuthSession | null = null;

  constructor(private readonly reason: string) {}

  onStateChange(): () => void {
    return () => undefined;
  }

  private failure(): AuthResult {
    return {
      ok: false,
      session: null,
      error: { code: 'provider_disabled', message: this.reason, statusCode: null },
      nextStep: 'none',
    };
  }

  signInWithPassword(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  signUpWithPassword(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  sendMagicLink(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  sendPasswordReset(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  updatePassword(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  sendEmailOtp(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  verifyEmailOtp(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  sendPhoneOtp(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  verifyPhoneOtp(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  beginOAuth(): Promise<string> {
    return Promise.reject(new Error(this.reason));
  }

  completeOAuth(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  refreshSession(): Promise<AuthResult> {
    return Promise.resolve(this.failure());
  }

  signOut(): Promise<void> {
    return Promise.resolve();
  }
}
