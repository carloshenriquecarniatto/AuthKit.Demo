# AuthKit for Aurelia — demo

Aurelia 2 (Vite + TypeScript) demo of **`@authkit/aurelia2`**, the plugin-only AuthKit SDK for
server-driven Cl@ve federation. It is one of the three halves of `AuthKit.Demo`; the Angular and
Blazor halves use Supabase, this one uses Cl@ve.

Everything runs against the .NET host on `http://localhost:5080`, same origin:

| Endpoint                            | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `GET /config.json`                  | `claveLoginPath` (read at runtime, never bundled)      |
| `GET /session`                      | host-owned cookie session as claims, or anonymous      |
| `POST /logout` / `GET /logout`      | sign-out (the demo host maps only GET, see below)      |
| `GET /clave/login?...`              | starts the federation and redirects to `returnUrl`     |
| `/aurelia/`                         | this app (static build)                                |

## Commands

The SDK is consumed from the sibling checkout, so build it first:

```bash
cd ../../../AuthKit.Aurelia/authkit-aurelia2   # from src/aurelia-demo
npm install
npm run build
```

Then, in this directory:

```bash
npm install
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # serves dist/ on http://localhost:4173/aurelia/
npm run dev        # Vite dev server (see the note below)
```

`package.json` installs the SDK with
`"@authkit/aurelia2": "file:../../../AuthKit.Aurelia/authkit-aurelia2"` — three levels up from
`AuthKit.Demo/src/aurelia-demo`, not two. npm symlinks it; rebuild the SDK after changing its
source, this app does not watch it.

Build output (Vite 7, `base: '/aurelia/'`):

```
dist/index.html                    ~0.74 kB
dist/assets/index-<hash>.js      ~242.75 kB  (gzip ~77.7 kB)
dist/styles.css                     copied from public/
```

Publish `dist/` where the host serves `/aurelia/` (the host's static root; `UseStaticFiles()` must
see an `aurelia` directory). `index.html` already references `/aurelia/assets/…` and
`/aurelia/styles.css`.

`npm run dev` renders the page but cannot complete a federation by itself: `/config.json`,
`/session` and `/clave/login` live on the .NET host, not on the Vite dev server. Without them the
page shows the fallback banner and the signed-out state — which is also the documented
`config.json` failure behaviour.

## What the page shows

1. **Sessão** — fetches `/session`, maps the host claims onto `AuthSession` and calls
   `client.setSession(...)`. Shows `name`, `acr`, `amr`, `provider`, `tenant`, `docType`, `sub`,
   plus the SDK mirror (`provider.ref`, `loa`, `identity.method`, empty `accessToken`). Sign-out
   posts to `/logout`, then re-reads `/session`.
2. **Federação Cl@ve** — one button per descriptor **method**, with a level selector only when the
   method declares more than one level. It calls
   `client.beginFederation(providerRef, level, method, returnUrl)` and navigates to the returned
   URL. The level selector is rendered for `certificate` (substantial + high) and the recommended
   flag marks `clave_movil`.
3. **Configuração** — the effective config (`baseUrl`, `audience`, `loginPath`, `loginUrl`,
   descriptors, session store) and the API tables for `AuthKitConfiguration`, `IAuthKitClient`,
   `AuthKitHttpInterceptor` and the optional route guard. The SDK ships no components, so this is
   the "component library" equivalent: documented data and plugin surface.

## Wiring

```ts
// main.ts — /config.json is read before Aurelia starts.
Aurelia.register(
  HttpClient,                          // must come before AuthKitHttpClient
  Registration.instance(DemoRuntime, runtime),
  AuthKitConfiguration.customize({
    baseUrl: window.location.origin,   // origin only, no path
    audience: 'demo',
    loginPath: runtime.config.claveLoginPath,
    providers: DEMO_PROVIDERS,
  }),
  AuthKitHttpClient,                   // installs the interceptor on IHttpClient
).app({ host, component: AppElement });
```

`AuthKitConfiguration.customize` already registers `IAuthKitClient` as a singleton (plus
`AuthKitConfig`, `AuthKitSessionStore`, the interceptor and the guard), so there is no second
registration for the client.

### Descriptors: one provider, three methods

`src/descriptors.ts` declares **one** `clave` provider with `clave_movil`, `clave_permanente` and
`certificate`. That matches the .NET SDK (`ClaveMethods.cs`: "Methods are a request parameter, not a
provider: one Cl@ve registration offers all of them") and the host's `ProviderRef = "demo/clave"`.
Registration validation requires exactly one `isPrimary` provider when the audience has several, so
splitting methods into providers would also mean inventing primary/ambiguity metadata.

The UI never switches on a method id: ordering, labels, descriptions, `levels` and `recommended`
all come from the descriptor array. Adding a fourth method needs no change in
`clave-panel.ts`/`.html`.

### Session mirroring is host code

The SDK does not call the host. `SessionPanel` is the adapter: it reads `/session` and maps the
claims to the contract (`src/session-mapping.ts`). Two consequences:

- the browser mirror has `accessToken: ''` and `expiresAt: ''` because a cookie session has no
  browser-visible token or expiry; the interceptor therefore stays inert, by design;
- `provider.ref` is `demo/clave` (the provider this client instance owns), while the raw host
  `provider` claim is displayed separately.

`?error=` / `?error_reason=` on the return URL are read with `client.completeFederation(...)` and
stripped with `callbackUrlWithoutOutcome(...)`. It is called only when such a parameter exists,
because with no session it would otherwise report `identity_not_verified` on every anonymous visit.

## Supabase vs Cl@ve: the two halves

|                        | Angular / Blazor halves                          | Aurelia half                                        |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Provider               | Supabase (GoTrue via the host proxy)             | Cl@ve (SAML pasarela, validated by the host)        |
| AuthKit surface        | UI components + `IAuthProvider` operations       | Plugin only: client, interceptor, route guard       |
| Where credentials live | Browser (session storage / SDK-managed session)  | Server only; the browser gets a cookie              |
| Sign-in                | Email/password, magic link, reset, OTP, OAuth    | `beginFederation` → host → IdP → host → `returnUrl` |
| Session read           | Supabase client session                          | `GET /session` claims mirrored onto `AuthSession`   |
| Token in browser       | Yes (the Supabase access token)                  | Never                                               |
| UI rendering           | Library components                               | Host renders the descriptors (`client.providers`)   |

The shared point is the contract: both platforms expose the same `AuthSession`, `AuthUser`,
`AuthIdentity`, error codes and provider descriptors, so a route guard or a session badge looks the
same in all three apps.

## Upstream API notes (read before copying the brief's snippet)

1. **`beginFederation` is positional.** The installed SDK is
   `beginFederation(providerRef: string, level, method?, returnUrl?)`, not
   `beginFederation({ providerRef, level, method, returnUrl })`. The object form does not compile
   against `@authkit/aurelia2@0.1.0`.
2. **`POST /logout` is not mapped by the demo host.** `Program.cs` maps `GET /logout`, so the demo
   posts first and falls back to GET on 404/405, surfacing a notice. The outcome is confirmed by
   re-reading `/session`, not by the redirect target's status.
3. **Aurelia 2 has no `.one-way` binding command.** `disabled.one-way` fails at runtime with
   `AUR0009:au:resource:binding-command:one-way`. Plain attributes use `.bind` (one-way by
   default); the level selector uses `<select value.bind="…">` instead of radios because
   `checked.bind` on a non-assignable expression is not a one-way binding.
4. **This checkout's path contains `#`.** Vite splits candidate paths at `#` (URL fragment), so
   relative imports and the `file:` symlink fail to resolve. `vite.config.ts` compensates with a
   pre-resolution plugin (relative ids) and an alias to the built SDK entry; `public/styles.css` +
   a `<link>` keeps CSS out of Vite's asset pipeline. Vite prints its own warning about the root
   path. Cloning to a path without `#` needs none of this (the plugin and alias are harmless).
5. **`@aurelia/router@2.0.0-rc.2` has no `IRouter.addHook`.** The single-page demo does not use
   the guard; the supported shape is `canLoad = resolve(IAuthKitRouteGuard).canLoad` on a component,
   documented in the configuration table.
6. **No secrets.** Only `/config.json` is read; the Supabase URL/anon key are ignored by this app.
   The page renders with a clear banner when `/config.json` fails.

## Layout

```
src/aurelia-demo/
├── index.html
├── vite.config.ts            base /aurelia/, outDir dist, `#` workarounds
├── tsconfig.json             same strictness as the SDK; no legacy decorators
├── public/styles.css         copied verbatim (light cards, system font, top bar)
└── src/
    ├── main.ts               config.json → DI registration → Aurelia.start
    ├── app.ts/.html          top bar + warning + the three sections
    ├── runtime-config.ts     runtime config, fallback and warning
    ├── descriptors.ts        the Cl@ve provider and its three methods
    ├── session-mapping.ts    /session claims → AuthSession
    └── components/
        ├── session-panel.ts/.html
        ├── clave-panel.ts/.html
        └── config-section.ts/.html
```

Components are defined with `CustomElement.define({ name, template }, Class)` rather than
`@customElement`: the SDK's tsconfig uses standard decorators, while Vite's esbuild only
transpiles legacy ones, so definitions avoid the mismatch and need no Aurelia Vite plugin.
