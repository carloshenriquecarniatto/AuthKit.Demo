import { formatProviderRef, type AuthAssuranceLevel, type AuthDocumentType, type AuthSession } from '@authkit/aurelia2';

/** `GET /session` as the demo host returns it (claims, not an AuthKit session). */
export interface HostSessionPayload {
  readonly authenticated: boolean;
  readonly sub?: string | null;
  readonly name?: string | null;
  /** eIDAS ACR URI, for example `http://eidas.europa.eu/LoA/substantial`. */
  readonly acr?: string | null;
  /** Authentication method: `clave_movil`, `clave_permanente`, `certificate`. */
  readonly amr?: string | null;
  readonly provider?: string | null;
  readonly tenant?: string | null;
  readonly docType?: string | null;
}

const DOCUMENT_TYPES: readonly AuthDocumentType[] = ['dni', 'nie', 'cif'];

export function documentTypeOf(value: string | null | undefined): AuthDocumentType {
  return DOCUMENT_TYPES.find((type) => type === value) ?? 'unknown';
}

/** eIDAS levels are ordered; anything unrecognised fails closed to `low`. */
export function acrToLevel(acr: string | null | undefined): AuthAssuranceLevel {
  if (acr === null || acr === undefined) {
    return 'low';
  }

  const value = acr.trim().toLowerCase();
  if (value === 'high' || value.endsWith('/high')) {
    return 'high';
  }
  if (value === 'substantial' || value.endsWith('/substantial')) {
    return 'substantial';
  }
  return 'low';
}

export interface SessionMirrorOptions {
  readonly audience: string;
  readonly provider: { readonly id: string; readonly kind: string; readonly displayName: string };
}

/**
 * Host adapter: maps the claims the host owns onto the contract's `AuthSession`
 * so `IAuthKitClient.session`, `user`, `loa` and the route guard can be used.
 *
 * This mapping lives in the demo, not in the SDK: only the host knows how it
 * mints a session. Cookie sessions carry no token (empty `accessToken`, so the
 * interceptor stays out of the way) and no browser-visible expiry.
 */
export function toAuthSession(
  payload: HostSessionPayload,
  options: SessionMirrorOptions,
): AuthSession | null {
  if (payload.authenticated !== true) {
    return null;
  }

  const subject = typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : 'unknown';
  const tenant = payload.tenant ?? null;
  const capturedAt = new Date().toISOString();

  return {
    accessToken: '',
    refreshToken: null,
    expiresAt: '',
    tokenType: 'cookie',
    user: {
      id: subject,
      email: null,
      phone: null,
      emailConfirmedAt: null,
      phoneConfirmedAt: null,
      displayName: payload.name ?? null,
      metadata: {},
      identity: {
        subject,
        documentType: documentTypeOf(payload.docType),
        // The host keeps the document number server-side; the browser receives
        // an opaque subject only.
        documentId: '',
        documentIdRaw: null,
        givenName: payload.name ?? null,
        familyName: null,
        dateOfBirth: null,
        level: acrToLevel(payload.acr),
        method: payload.amr ?? '',
        tenant,
        representedDocumentId: null,
        authenticatedAt: capturedAt,
      },
    },
    provider: {
      ref: formatProviderRef({ audience: options.audience, providerId: options.provider.id }),
      audience: options.audience,
      providerId: options.provider.id,
      kind: options.provider.kind,
      displayName: options.provider.displayName,
      origin: window.location.origin,
      tenant,
      capturedAt,
    },
  };
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
