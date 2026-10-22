import { CustomElement } from 'aurelia';
import { AuthKitConfig } from '@authkit/aurelia2';
import template from './config-section.html?raw';

interface Row {
  readonly label: string;
  readonly value: string;
}

interface ApiRow {
  readonly member: string;
  readonly description: string;
}

interface DescriptorRow {
  readonly title: string;
  readonly meta: string;
  readonly methods: readonly string[];
}

const CONFIGURATION_API: readonly ApiRow[] = [
  {
    member: 'AuthKitConfiguration.customize(options): IRegistry',
    description:
      'Valida as opções uma vez e regista AuthKitConfig, AuthKitSessionStore, IAuthKitClient, o interceptor e o route guard como singletons no IContainer da Aurelia.',
  },
  {
    member: 'options.baseUrl',
    description: 'Origem absoluta do host, sem path. Validada no construtor de AuthKitConfig.',
  },
  {
    member: 'options.audience',
    description: 'Âmbito deste plugin (default "default"). Unidades de resolução de providers.',
  },
  {
    member: 'options.loginPath',
    description: 'Rota que inicia o login no host (default "/clave/login"); tem de começar por "/".',
  },
  {
    member: 'options.providers',
    description:
      'AuthFederationProvider[]. Ids/nomes únicos por audience e no máximo um isPrimary; a validação falha no arranque em vez de desenhar dois botões iguais.',
  },
  {
    member: 'options.loginRoute',
    description: 'Rota Aurelia usada pelo guard para mandar o anónimo (default "login").',
  },
];

const CLIENT_API: readonly ApiRow[] = [
  {
    member: 'session: AuthSession | null',
    description:
      '@observable. Templates e IObserverLocator reagem a setSession; o cliente nunca faz polling.',
  },
  {
    member: 'providers: readonly AuthFederationProvider[]',
    description: 'A lista que esta página renderiza. Labels, níveis e ordem vêm daqui.',
  },
  {
    member: 'user, loa, isAuthenticated',
    description: 'Getters derivados de session (utilizador, nível eIDAS, presença).',
  },
  {
    member: 'beginFederation(providerRef, level, method?, returnUrl?)',
    description:
      'Assinatura posicional; devolve Promise<string> com o URL do host. Não navega, não faz fetch.',
  },
  {
    member: 'completeFederation(callbackUrl): AuthResult',
    description:
      'Lê error/error_reason do redirect. Sem sessão devolve identity_not_verified; não há troca de token.',
  },
  {
    member: 'setSession(session | null)',
    description: 'Bootstrap do host: guarda no AuthKitSessionStore pelo ref canónico e substitui session.',
  },
  {
    member: 'onSessionChanged(listener): () => void',
    description: 'Subscrição explícita para código fora da observação da Aurelia; devolve unsubscribe.',
  },
  {
    member: 'signOut(): Promise<void>',
    description: 'Limpa apenas o provider que este cliente possui (R-22), nunca outra sessão.',
  },
  {
    member: 'signInWithPassword, sendMagicLink, sendEmailOtp, …',
    description: 'Devolvem provider_disabled com "only supports server-driven federation".',
  },
];

const INTERCEPTOR_API: readonly ApiRow[] = [
  {
    member: 'AuthKitHttpInterceptor.request(request)',
    description:
      'Acrescenta Authorization: Bearer apenas com token na sessão, mesma origem e sem header prévio.',
  },
  {
    member: 'AUTHKIT_SKIP_HEADER = "X-AuthKit-Skip"',
    description: 'Opt-out por pedido; o marcador é removido antes de a request sair do browser.',
  },
  {
    member: 'AuthKitHttpClient',
    description:
      'Registro separado que chama withInterceptor no IHttpClient. Registar depois do HttpClient; antes é erro de configuração.',
  },
];

const GUARD_API: readonly ApiRow[] = [
  {
    member: 'canLoad = resolve(IAuthKitRouteGuard).canLoad',
    description:
      'Hook de componente (rc.2). Devolve true ou o URL "login?returnUrl=…&reason=…"; nunca chama o router.',
  },
  {
    member: 'data: { authKit: { loa, audience, providerRef } }',
    description: 'Requisito lido de next.data; nível insuficiente, audience/provider trocados ou anónimo redirecionam.',
  },
  {
    member: '@aurelia/router@2.0.0-rc.2',
    description:
      'Não expõe IRouter.addHook (só load/generatePath/updateTitle), por isso o fallback por componente é o que existe.',
  },
];

/**
 * The "component library" section of a plugin-only SDK: the effective
 * configuration plus the API surface read straight from the package source.
 */
export class ConfigSection {
  static inject = [AuthKitConfig];

  readonly effective: readonly Row[];
  readonly descriptors: readonly DescriptorRow[];
  readonly configurationApi = CONFIGURATION_API;
  readonly clientApi = CLIENT_API;
  readonly interceptorApi = INTERCEPTOR_API;
  readonly guardApi = GUARD_API;

  constructor(config: AuthKitConfig) {
    const methodCount = config.providers.reduce((total, provider) => total + provider.methods.length, 0);
    const providerLabel =
      config.providers.length === 1 ? '1 provider' : `${config.providers.length} providers`;
    const methodLabel = methodCount === 1 ? '1 método' : `${methodCount} métodos`;

    this.effective = [
      { label: 'baseUrl', value: config.baseUrl },
      { label: 'audience', value: config.audience },
      { label: 'loginPath', value: config.loginPath },
      { label: 'loginUrl', value: config.loginUrl },
      { label: 'loginRoute', value: config.loginRoute },
      { label: 'descriptors', value: `${providerLabel} · ${methodLabel}` },
      {
        label: 'session store',
        // Class name is literal on purpose: `.constructor.name` is mangled by the
        // production build. The registered singleton is AuthKitSessionStore.
        value: 'AuthKitSessionStore — Map em memória, uma entrada por provider ref, nada persistido',
      },
      { label: 'token no browser', value: 'nenhum; a asserção é validada no host' },
    ];

    this.descriptors = config.providers.map((provider) => ({
      title: `${provider.displayName} (${provider.id})`,
      meta: `kind=${provider.kind} · levels=[${provider.levels.join(', ')}] · isPrimary=${provider.isPrimary}`,
      methods: provider.methods.map(
        (method) =>
          `${method.id} → [${method.levels.join(', ')}]${method.recommended ? ' · recomendado' : ''}`,
      ),
    }));
  }
}

export const ConfigSectionElement = CustomElement.define(
  { name: 'ak-config-section', template },
  ConfigSection,
);
