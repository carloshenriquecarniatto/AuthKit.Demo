import { CustomElement } from 'aurelia';
import {
  AuthKitConfig,
  IAuthKitClient,
  providerRefOf,
  type AuthAssuranceLevel,
  type AuthFederationMethod,
  type AuthFederationProvider,
} from '@authkit/aurelia2';
import template from './clave-panel.html?raw';
import { describeError } from '../session-mapping';

const LEVEL_LABELS: Readonly<Record<AuthAssuranceLevel, string>> = {
  low: 'Low',
  substantial: 'Substantial',
  high: 'High',
};

/**
 * Reference usage: the SDK has no UI components, so the host builds the Cl@ve
 * screen from `client.providers`.
 *
 * Everything rendered here — order, labels, descriptions, levels, the
 * recommended flag — comes from the descriptors. There is no `switch` on
 * `clave_movil` / `clave_permanente` / `certificate`, and adding a fourth
 * method would need no change in this file.
 */
export class ClavePanel {
  static inject = [IAuthKitClient, AuthKitConfig];

  readonly auth: IAuthKitClient;
  readonly returnUrl = import.meta.env.BASE_URL;
  /** Selected level per method id, seeded from each method's first level. */
  readonly levels: Record<string, AuthAssuranceLevel> = {};

  private readonly config: AuthKitConfig;
  error: string | null = null;
  busyMethod: string | null = null;

  constructor(auth: IAuthKitClient, config: AuthKitConfig) {
    this.auth = auth;
    this.config = config;

    for (const provider of auth.providers) {
      for (const method of provider.methods) {
        this.levels[method.id] = method.levels[0] ?? 'substantial';
      }
    }
  }

  /** Canonical `audience/providerId`, exactly what `beginFederation` expects. */
  providerRef(provider: AuthFederationProvider): string {
    return providerRefOf({ audience: this.config.audience, provider });
  }

  levelLabel(level: AuthAssuranceLevel): string {
    return LEVEL_LABELS[level] ?? level;
  }

  setLevel(methodId: string, level: AuthAssuranceLevel): void {
    this.levels[methodId] = level;
  }


  async begin(provider: AuthFederationProvider, method: AuthFederationMethod): Promise<void> {
    this.error = null;
    this.busyMethod = method.id;

    try {
      const level = this.levels[method.id] ?? method.levels[0];
      if (level === undefined) {
        throw new Error(`O método "${method.id}" não declara nenhum nível eIDAS.`);
      }

      // Positional signature, not an options object:
      // beginFederation(providerRef, level, method, returnUrl) → Promise<string>.
      const url = await this.auth.beginFederation(
        this.providerRef(provider),
        level,
        method.id,
        this.returnUrl,
      );

      // The SDK never navigates. The host decides when the browser moves.
      window.location.assign(url);
    } catch (error) {
      this.error = `beginFederation falhou: ${describeError(error)}`;
      this.busyMethod = null;
    }
  }
}

export const ClavePanelElement = CustomElement.define(
  { name: 'ak-clave-panel', template },
  ClavePanel,
);
