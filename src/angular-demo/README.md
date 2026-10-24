# AuthKit for Angular — demo

Galeria de componentes do `@authkit/angular` (Angular 22, standalone, sem NgModule, sem router)
servida pelo host de demonstração em `http://localhost:5080/angular/`. O único provider é o
Supabase Auth local.

## Comandos

```bash
cd src/angular-demo
npm install    # liga @authkit/angular ao dist local do SDK
npm run build  # -> dist/angular-demo/browser
```

Pré-requisito: o SDK tem de estar compilado antes do `npm install`, porque a dependência é
`file:` para o artefacto de build:

```bash
cd ../../AuthKit.Angular
npm install
npx ng build authkit
```

Para iterar com o host: `npm run build`, e o host serve `src/angular-demo/dist/angular-demo/browser`
em `/angular/`. `npm start` (dev-server) serve o mesmo conteúdo em
`http://localhost:4200/angular/`, mas sem `/config.json` nem `/auth/v1`: use o host para a demo a
sério.

O shell visual (tokens, topbar, hero, cards, tabelas, botões) é
`src/AuthKit.Demo.Host/wwwroot/shared/demo.css`, servido pelo host em `/shared/demo.css` e ligado no
`index.html`. `src/styles.css` e `app.css` só têm o que é específico desta galeria; abrir o build
sem o host mostra a página sem estilos.

## Rotas do host usadas pela app

| Rota | Método | Uso |
| --- | --- | --- |
| `/angular/` | GET | A app (base href `/angular/`). |
| `/config.json` | GET | `supabaseUrl` e `supabaseAnonKey`. Lido **antes** do bootstrap. |
| `/auth/v1/*` | — | Proxy do host para o gotrue local. O cliente Supabase usa `window.location.origin`. |
| `/pt.json` | GET | Catálogo de mensagens usado por omissão. |

## O que a página mostra

1. **Supabase**: `<ak-email>`, `<ak-magic-link>`, `<ak-reset-password>` e `<ak-socials>`, em tabs.
   O provider é registado com `provideAuthKitSupabase({ url, anonKey, redirectTo })`, com
   `redirectTo = window.location.origin + '/angular/'`.
2. **Configuração**: os valores efetivos lidos de `/config.json`.
3. **Componentes**: tabelas de inputs/outputs de cada componente, copiadas do código do SDK.

## Storybook

`/angular/?story=email&…` monta **um** componente real com os providers da app, sem shell. É o frame
que o Storybook Angular usa para os controlos; não há uma segunda implementação. Parâmetros
suportados: `showConfirmPasswordField`, `showForgotPassword`, `showSignUp`, `prefilledEmail`,
`updateMode`, `providers`, `colored`, `variant` e `labels` (JSON).

## Decisões

- **Config primeiro.** `main.ts` faz `await loadConfig()` e só depois `bootstrapApplication`. Se o
  `/config.json` falhar, a app arranca com um `DisabledAuthProvider` que devolve a mensagem de erro
  nos próprios componentes: sem provider, os componentes rebentariam com `NullInjectorError` e a
  página não renderizava.
- **Labels são do componente.** `labels` é um `@Input` de cada formulário e sobrepõe-se ao catálogo
  (`/pt.json`) só naquela instância. `showForgotPassword` e `showSignUp` também são inputs.
- **Inputs reagem.** `prefilledEmail` e `prefilledPassword` são aplicados em `ngOnChanges`; lê-los no
  construtor via sempre o default, porque o Angular liga os inputs depois do construtor.
- **O build assume o host.** `/shared/demo.css` e `/pt.json` são servidos pelo host; sem ele a
  página fica sem estilos e sem catálogo (cai para inglês).
