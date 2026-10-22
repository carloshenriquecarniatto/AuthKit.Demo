/**
 * Component library data for the "Componentes" section.
 *
 * Every row mirrors an `@Input()` / `@Output()` in
 * AuthKit.Angular/projects/authkit/src/lib/{components,clave}/*.component.ts. When the SDK
 * changes, this file changes with it — the tables are the documentation, so a stale row is a bug.
 */

export interface InputRow {
  readonly name: string;
  readonly type: string;
  readonly defaultValue: string;
  readonly description: string;
}

export interface OutputRow {
  readonly name: string;
  readonly payload: string;
  readonly description: string;
}

export interface ComponentDoc {
  readonly selector: string;
  readonly title: string;
  readonly summary: string;
  readonly inputs: readonly InputRow[];
  readonly outputs: readonly OutputRow[];
}

export const COMPONENT_DOCS: readonly ComponentDoc[] = [
  {
    selector: 'ak-email',
    title: 'E-mail e palavra-passe',
    summary:
      'Sign-in, sign-up e recuperação num só componente. O modo sign-up só é oferecido quando o provider declara password + signUp.',
    inputs: [
      {
        name: 'metadataFields',
        type: 'readonly AuthMetadataField[]',
        defaultValue: '[]',
        description:
          'Campos extra de sign-up (text ou boolean) enviados como user metadata. Marcar required bloqueia o submit.',
      },
      {
        name: 'showConfirmPasswordField',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Mostra um segundo campo de palavra-passe no sign-up e compara os dois.',
      },
      {
        name: 'prefilledEmail',
        type: 'string',
        defaultValue: "''",
        description: 'Valor inicial do campo de e-mail.',
      },
      {
        name: 'prefilledPassword',
        type: 'string',
        defaultValue: "''",
        description: 'Valor inicial do campo de palavra-passe.',
      },
      {
        name: 'redirectTo',
        type: 'string | null',
        defaultValue: 'null',
        description:
          'Substitui, só neste formulário, o redirectTo configurado no bootstrap (usado no e-mail de recuperação).',
      },
    ],
    outputs: [
      {
        name: 'signInComplete',
        payload: 'AuthSession',
        description: 'Sessão emitida depois de um sign-in com sucesso.',
      },
      {
        name: 'signUpComplete',
        payload: 'AuthResult',
        description:
          'Resultado do sign-up. `session` é null quando o provider exige confirmação por e-mail.',
      },
      {
        name: 'passwordResetSent',
        payload: 'void',
        description: 'Emitido quando o e-mail de recuperação foi aceite pelo provider.',
      },
      {
        name: 'failed',
        payload: 'AuthError | null',
        description: 'Erro do provider, já traduzido para o contrato AuthKit.',
      },
    ],
  },
  {
    selector: 'ak-magic-link',
    title: 'Magic link',
    summary:
      'Sign-in sem palavra-passe: pede o e-mail e deixa o provider enviar o link. Mostra o estado "checkYourEmail".',
    inputs: [
      {
        name: 'redirectTo',
        type: 'string | null',
        defaultValue: 'null',
        description: 'Substitui o redirectTo do bootstrap para o link enviado.',
      },
      {
        name: 'prefilledEmail',
        type: 'string',
        defaultValue: "''",
        description: 'Valor inicial do campo de e-mail.',
      },
    ],
    outputs: [
      {
        name: 'sentLink',
        payload: 'void',
        description: 'O provider aceitou o pedido do magic link.',
      },
      {
        name: 'failed',
        payload: 'AuthError | null',
        description: 'Erro do provider.',
      },
    ],
  },
  {
    selector: 'ak-reset-password',
    title: 'Recuperação de palavra-passe',
    summary:
      'Dois modos: pedir o e-mail de recuperação, ou definir a nova palavra-passe na página onde o link aterra.',
    inputs: [
      {
        name: 'redirectTo',
        type: 'string | null',
        defaultValue: 'null',
        description: 'Substitui o redirectTo do bootstrap para o e-mail de recuperação.',
      },
      {
        name: 'prefilledEmail',
        type: 'string',
        defaultValue: "''",
        description: 'Valor inicial do campo de e-mail.',
      },
      {
        name: 'updateMode',
        type: 'boolean',
        defaultValue: 'false (setter; sem atributo o modo é "request")',
        description:
          'Abre diretamente no formulário de nova palavra-passe. É um setter, por isso o valor é aplicado no binding.',
      },
    ],
    outputs: [
      {
        name: 'resetRequested',
        payload: 'void',
        description: 'E-mail de recuperação aceite pelo provider.',
      },
      {
        name: 'passwordUpdated',
        payload: 'void',
        description: 'Palavra-passe atualizada com sucesso.',
      },
      {
        name: 'failed',
        payload: 'AuthError | null',
        description: 'Erro do provider.',
      },
    ],
  },
  {
    selector: 'ak-socials',
    title: 'Fornecedores sociais',
    summary:
      'Um botão por provider OAuth. Sem binding em `oauthRequested` o próprio componente faz location.assign(url); com binding, a navegação passa a ser do host.',
    inputs: [
      {
        name: 'providers',
        type: 'readonly string[] | null',
        defaultValue: 'null',
        description: 'Lista de providers. Null usa os socialProviders declarados no bootstrap.',
      },
      {
        name: 'colored',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Aplica a cor de marca de cada provider ao botão.',
      },
      {
        name: 'variant',
        type: "'icon' | 'icon-and-text'",
        defaultValue: "'icon-and-text'",
        description: 'Só ícone ou ícone com o texto "Continuar com …".',
      },
      {
        name: 'redirectTo',
        type: 'string | null',
        defaultValue: 'null',
        description: 'Substitui o redirectTo do bootstrap no início do fluxo OAuth.',
      },
    ],
    outputs: [
      {
        name: 'oauthRequested',
        payload: 'string (URL)',
        description:
          'URL de autorização. Se estiver ligado, o componente não navega: o host decide (popup, browser nativo, redirect).',
      },
      {
        name: 'failed',
        payload: 'AuthError | null',
        description: 'Erro ao construir o URL de autorização.',
      },
    ],
  },
  {
    selector: 'ak-clave',
    title: 'Cl@ve (federação eIDAS)',
    summary:
      'Um controlo por método declarado no descritor, mais um seletor de nível quando o descritor declara mais de um. Constrói o URL do host; não navega nem fala com o IdP.',
    inputs: [
      {
        name: 'providers',
        type: 'readonly AuthFederationProvider[] | null',
        defaultValue: 'null',
        description:
          'Descritores a renderizar. Null usa os que o provider registado declara em capabilities.federation.',
      },
      {
        name: 'level',
        type: 'AuthAssuranceLevel | null',
        defaultValue: 'null',
        description:
          'Força o nível (low | substantial | high) e esconde o seletor. Null deixa o utilizador escolher.',
      },
      {
        name: 'returnUrl',
        type: 'string | null',
        defaultValue: 'null',
        description:
          'Para onde o host deve devolver o utilizador. Vai como query param e é validado pelo host (same-origin).',
      },
      {
        name: 'loginPath',
        type: 'string',
        defaultValue: "'/clave/login'",
        description: 'Rota do host que inicia a federação (a que foi mapeada com MapClave).',
      },
      {
        name: 'showLevelSelector',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Mostra o seletor de nível quando o descritor declara mais de um nível.',
      },
      {
        name: 'levelLabel',
        type: 'string',
        defaultValue: "'Level of assurance'",
        description: 'Etiqueta acima do seletor de nível.',
      },
      {
        name: 'emptyMessage',
        type: 'string',
        defaultValue: "'No login method is available.'",
        description: 'Mensagem quando não há descritores ou um descritor não declara métodos.',
      },
      {
        name: 'levelLabels',
        type: 'Partial<Record<AuthAssuranceLevel, string>>',
        defaultValue: "{ low: 'Low', substantial: 'Substantial', high: 'High' }",
        description:
          'Etiquetas do seletor. O contrato ainda não tem chaves de mensagem para os níveis, por isso são input.',
      },
    ],
    outputs: [
      {
        name: 'navigate',
        payload: 'string (URL de login)',
        description:
          'Emitido ao clicar num método. Ligado, o componente renderiza botões; sem binding renderiza <a href> reais e funciona sem handler.',
      },
    ],
  },
  {
    selector: 'ak-clave-callback',
    title: 'Callback de federação',
    summary:
      'Lê error / error_reason do URL, limpa-os e emite o resultado. Não faz rede, não troca tokens, não navega e não injeta Router.',
    inputs: [
      {
        name: 'callbackUrl',
        type: 'string | null',
        defaultValue: 'null',
        description: 'URL a inspecionar. Null usa document.location.href.',
      },
      {
        name: 'replaceHistory',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'Substitui a entrada de histórico pelo URL limpo. Desligado por omissão: a navegação é do host.',
      },
    ],
    outputs: [
      {
        name: 'completed',
        payload: 'AuthKitFederationOutcome',
        description:
          'Emitido uma vez por montagem: { ok, error, cleanUrl, returnUrl }. O motivo cru nunca é exposto.',
      },
    ],
  },
];
