import type { AuthFederationProvider } from '@authkit/aurelia2';

/**
 * Audience this plugin instance serves. The host mints its sessions with
 * `ProviderRef = "demo/clave"` (AuthKit.Demo.Host/Program.cs), which is
 * `audience = "demo"` + `provider.id = "clave"`.
 */
export const DEMO_AUDIENCE = 'demo';

/**
 * One Cl@ve registration, three methods.
 *
 * AuthKit treats methods as a request parameter, not as separate providers
 * (`AuthKit.Clave/ClaveMethods.cs`: "one Cl@ve registration offers all of
 * them"). The labels, order, levels and the recommended flag are data: the UI
 * renders them with no `switch` on a method id.
 */
export const CLAVE_PROVIDER: AuthFederationProvider = {
  id: 'clave',
  kind: 'eidas',
  displayName: 'Cl@ve',
  description:
    'Federação server-driven com a pasarela Cl@ve. A asserção SAML é validada pelo host; o browser nunca vê um token.',
  iconUrl: null,
  isPrimary: true,
  levels: ['substantial', 'high'],
  methods: [
    {
      id: 'clave_movil',
      displayName: 'Cl@ve Móvil',
      description: 'Notificação push na app Cl@ve, confirmada no telemóvel.',
      levels: ['substantial'],
      recommended: true,
    },
    {
      id: 'clave_permanente',
      displayName: 'Cl@ve Permanente',
      description: 'Utilizador e palavra-passe permanentes da Cl@ve.',
      levels: ['substantial'],
      recommended: false,
    },
    {
      id: 'certificate',
      displayName: 'Certificado / DNIe',
      description: 'Certificado eletrónico reconhecido. Pode chegar ao nível high.',
      levels: ['substantial', 'high'],
      recommended: false,
    },
  ],
};

/** Descriptor list handed to `AuthKitConfiguration.customize`. */
export const DEMO_PROVIDERS: readonly AuthFederationProvider[] = [CLAVE_PROVIDER];
