import type { AuthAssuranceLevel, AuthFederationProvider } from '@authkit/angular';

/**
 * Cl@ve descriptors rendered by `<ak-clave>`. They are UI data only: the SAML exchange, the ACS
 * and the session stay in the host. Method ids match the host's `ClaveLoginService` allow-list.
 *
 * Two descriptors on purpose: the assurance-level selector only appears for a descriptor that
 * declares more than one level, and Cl@ve Móvil / Permanente are substantial-only while a
 * certificate can also satisfy `high`. Putting them in one descriptor would offer `loa=high` for a
 * method that cannot deliver it.
 */
export const CLAVE_PROVIDERS: readonly AuthFederationProvider[] = [
  {
    id: 'clave',
    kind: 'eidas',
    displayName: 'Cl@ve',
    description: 'Identidade digital espanhola. O host inicia a federação e define a sessão.',
    iconUrl: null,
    levels: ['substantial'],
    isPrimary: true,
    methods: [
      {
        id: 'clave_movil',
        displayName: 'Cl@ve Móvil',
        description: 'Aprovação no telemóvel. Recomendado.',
        levels: ['substantial'],
        recommended: true,
      },
      {
        id: 'clave_permanente',
        displayName: 'Cl@ve Permanente',
        description: 'Utilizador e palavra-passe do Cl@ve.',
        levels: ['substantial'],
        recommended: false,
      },
    ],
  },
  {
    id: 'certificado',
    kind: 'eidas',
    displayName: 'Certificado digital',
    description: 'Certificado qualificado no browser. Escolha o nível de garantia.',
    iconUrl: null,
    levels: ['substantial', 'high'],
    isPrimary: false,
    methods: [
      {
        id: 'certificate',
        displayName: 'Entrar com certificado',
        description: 'DNIe ou certificado qualificado instalado no browser.',
        levels: ['substantial', 'high'],
        recommended: true,
      },
    ],
  },
];

/** Portuguese labels: the contract has no message key for the level selector yet. */
export const CLAVE_LEVEL_LABELS: Partial<Record<AuthAssuranceLevel, string>> = {
  low: 'Baixo',
  substantial: 'Substancial',
  high: 'Elevado',
};
