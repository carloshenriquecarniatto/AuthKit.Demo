# AuthKit for Angular — demo

Galeria de componentes do `@authkit/angular` (Angular 22, standalone, sem NgModule, sem router)
servida pelo host de demonstração em `http://localhost:5080/angular/`.

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
`http://localhost:4200/angular/`, mas sem `/config.json`, `/session` nem `/auth/v1`: use o host
para a demo a sério.

## Rotas do host usadas pela app

| Rota | Método | Uso |
| --- | --- | --- |
| `/angular/` | GET | A app (base href `/angular/`). |
| `/config.json` | GET | `supabaseUrl`, `supabaseAnonKey`, `claveLoginPath`. Lido **antes** do bootstrap. |
| `/session` | GET | Sessão do host (cookie): `authenticated`, `sub`, `name`, `acr`, `amr`, `provider`, `tenant`, `docType`. |
| `/logout` | POST | Termina a sessão; 302 para `/`. |
| `/clave/login?loa=…&method=…&returnUrl=…` | GET | Inicia a federação Cl@ve no servidor. |
| `/auth/v1/*` | — | Proxy do host para o gotrue local. O cliente Supabase usa `window.location.origin`. |

## O que a página mostra

1. **Cabeçalho** com a sessão do host (`GET /session`, `credentials: 'include'`), identidade
   (`name`, `sub`, `acr`, `amr`, `provider`, `tenant`, `docType`) e logout (`POST /logout`).
2. **Supabase**: `<ak-email>`, `<ak-magic-link>`, `<ak-reset-password>` e `<ak-socials>`, em tabs.
   O provider é registado com `provideAuthKitSupabase({ url, anonKey, redirectTo })`, com
   `redirectTo = window.location.origin + '/angular/'`.
3. **Cl@ve (eIDAS)**: `<ak-clave [providers]="claveProviders" returnUrl="/angular/"
   (navigate)="go($event)">`, com dois descritores (`clave`, `certificado`) e os métodos
   `clave_movil`, `clave_permanente` e `certificate`.
4. **Configuração** e **Componentes**: a configuração efetiva e as tabelas de inputs/outputs de
   cada componente usado, copiadas do código do SDK.

## Decisões

- **Config primeiro.** `main.ts` faz `await loadConfig()` e só depois `bootstrapApplication`. Se o
  `/config.json` falhar, a app arranca com um `DisabledAuthProvider` que devolve a mensagem de erro
  nos próprios componentes: sem provider, os componentes rebentariam com `NullInjectorError` e a
  página não renderizava. Nesse modo a secção Supabase mostra o aviso em vez dos formulários, e o
  resto (Cl@ve, tabelas) continua a funcionar.
- **`<ak-clave-callback>` só quando é callback.** O componente não injeta `Router`, por isso
  funciona sem rotas. Mesmo assim só é montado quando o URL traz `error`/`error_reason`: montado em
  qualquer página, emite `ok: true` para um URL que não é um callback. Ver
  `hasFederationParams` em `src/app/app.ts`.
- **Dois descritores Cl@ve.** O seletor de nível só aparece quando um descritor declara mais de um
  nível, e `clave_movil`/`clave_permanente` não entregam `high`. Um descritor único ofereceria
  `loa=high` a métodos que não o satisfazem.
- **`preserveSymlinks: true`** em `angular.json`. O `file:` do SDK é um symlink; sem esta opção o
  bundler resolvia `@angular/core` a partir do `node_modules` do SDK e o bundle ficava com **duas**
  cópias do framework, o que rebenta com `NG0203` em todos os componentes (`inject()` em field
  initializers sem contexto de injeção).
- **`@angular/router` é dependência** ainda que a app não tenha rotas: o barrel do
  `@authkit/angular` exporta o `authKitGuard`, que importa `Router`.

## Desvios ao pedido

1. **Caminho da dependência.** O spec pedido foi `"@authkit/angular":
   "file:../../AuthKit.Angular/dist/authkit"`. A partir de `src/angular-demo` esse caminho resolve
   para `AuthKit.Demo/AuthKit.Angular`, que não existe; o correto é
   `file:../../../AuthKit.Angular/dist/authkit`.
2. **`POST /logout`.** O host atual (`src/AuthKit.Demo.Host/Program.cs`) só mapeia `GET /logout`,
   por isso um POST devolve 405. A app faz POST, como pedido, e se a resposta não for ok faz
   fallback para uma navegação de topo para `/logout` (GET). Quando o host mapear POST, o fallback
   deixa de ser usado.
3. **Providers sociais.** `github` e `google` estão declarados em `src/main.ts`; se o gotrue local
   não os tiver habilitados, o componente mostra o erro do provider em vez de navegar.
