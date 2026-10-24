/**
 * Component library data for the "Componentes" section.
 *
 * Every row mirrors an `@Input()` / `@Output()` in
 * AuthKit.Angular/projects/authkit/src/lib/components/*.component.ts. When the SDK
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
        name: 'showForgotPassword',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Mostra o link "esqueceste-te da palavra-passe?" no sign-in.',
      },
      {
        name: 'showSignUp',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Mostra o alternador sign-in/sign-up, mesmo quando o provider suporta sign-up.',
      },
      {
        name: 'labels',
        type: 'Partial<Record<AuthMessageKey, string>>',
        defaultValue: '{}',
        description:
          'Mensagens só para esta instância. Chaves em falta caem no catálogo configurado (/pt.json).',
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
        name: 'labels',
        type: 'Partial<Record<AuthMessageKey, string>>',
        defaultValue: '{}',
        description:
          'Mensagens só para esta instância; chaves em falta caem no catálogo configurado.',
      },
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
        name: 'labels',
        type: 'Partial<Record<AuthMessageKey, string>>',
        defaultValue: '{}',
        description:
          'Mensagens só para esta instância; chaves em falta caem no catálogo configurado.',
      },
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
        name: 'labels',
        type: 'Partial<Record<AuthMessageKey, string>>',
        defaultValue: '{}',
        description:
          'Mensagens só para esta instância; chaves em falta caem no catálogo configurado.',
      },
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
];
