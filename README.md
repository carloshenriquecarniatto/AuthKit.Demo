# AuthKit demo

A runnable, local demonstration of AuthKit on its own stacks: **Blazor** and **Angular**, both on
**Supabase Auth**. Everything runs on one origin, `http://localhost:5080`.

| Surface | What it shows |
| ------- | ------------- |
| Blazor  | `AuthKitEmail`, `AuthKitMagicLink`, `AuthKitResetPassword`, `AuthKitSocials` on InteractiveServer |
| Angular | `ak-email`, `ak-magic-link`, `ak-reset-password`, `ak-socials`, the interceptor and the guard |
| Storybook | every component and every parameter that changes what it renders, with live controls |

There is no external service and no second origin:

- **Supabase Auth** (gotrue) is local. Mail is caught by Mailpit.
- The .NET host proxies `/auth/v1` to gotrue and serves the Angular build and the Storybook.

## Prerequisites

- Docker (or colima) running.
- The two SDK repositories checked out **next to this one**:

```text
Dev/C#/AuthKit.Net
Dev/C#/AuthKit.Angular
Dev/C#/AuthKit.Demo      ← this repository
```

The .NET project references `AuthKit.Net` directly and the Angular app installs `@authkit/angular`
from the sibling checkout.

## Start

```bash
bash scripts/up.sh
```

The first run builds the images and installs the JavaScript dependencies; it takes a few minutes.
When it finishes:

| URL | What |
| --- | ---- |
| http://localhost:5080/ | landing page |
| http://localhost:5080/blazor | Blazor gallery |
| http://localhost:5080/angular/ | Angular gallery |
| http://localhost:5080/storybook/ | one Storybook: Blazor + Angular |
| http://localhost:5080/config.json | what the browser demos read (public anon key only) |
| http://localhost:8025 | Mailpit: magic links and recovery emails |

Stop with:

```bash
bash scripts/down.sh
```

`up.sh` generates a per-run JWT secret and anon key (`.env`), which is git-ignored. Nothing is reused
between runs.

## Documentation site

A static documentation site is published on GitHub Pages:

- https://carloshenriquecarniatto.github.io/AuthKit.Demo/

It contains a landing page, the Angular gallery and a Storybook with the Angular components (an
in-memory provider, no backend). The Blazor stories need the .NET host and stay in the Docker demo.
The site is built by `.github/workflows/pages.yml` with `scripts/pages-build.sh`; `PAGES_BASE`
controls the project-page prefix.

## What to try

1. Sign up with any e-mail and a password of 8+ characters (confirmation is disabled in the stack).
2. Sign out, then sign in with the same credentials.
3. Request a magic link or a recovery e-mail and open it from Mailpit at http://localhost:8025.

The Supabase session lives where the SDK puts it (`sessionStorage`); the host is only a proxy and a
static file server.

## Storybook

`/storybook/` is one manager for both stacks. The Blazor build is the manager (Blazor has no
official Storybook renderer) and composes the Angular build as a ref:

```text
/storybook/            Blazor stories (HTML renderer, iframes into /storybook-frame/…)
/storybook/angular/    Angular stories (HTML renderer, iframes into /angular/?story=…)
```

Every story has controls:

- **Blazor** args become query parameters; the host's `StoryFrame` passes them to the real component.
- **Angular** args become query parameters on the gallery's story mode, which renders the real
  component with the app's Supabase provider.
- **Labels** are a component input in both SDKs (`Labels` / `labels`), so a story can reword one
  instance without touching the startup catalog. `ShowForgotPassword`, `ShowSignUp`,
  `ShowConfirmPasswordField`, `UpdateMode`, `Socials` variants, etc. are component inputs too.

The host serves `wwwroot/pt.json`; the Blazor components and the Angular app use it as the default
catalog.

## How it is wired

```text
browser ──► host :5080 ──► /auth/v1/* ──► gotrue :9999 ──► postgres
                │
                ├─ /blazor, /storybook-frame/…   (Razor)
                ├─ /angular/, /storybook/        (static builds)
                └─ /config.json                  (URL + public anon key)
```

## Repository layout

```text
docker-compose.yml              db, mail, auth, host
docker/DemoHost.Dockerfile      .NET publish + Angular and Storybook builds
infra/db-init.sql               creates the auth schema gotrue migrates into
scripts/up.sh, down.sh          generate secrets, start/stop, wait for health
scripts/demo-secrets.mjs        per-run JWT secret and anon key
src/AuthKit.Demo.Host/          ASP.NET Core host: Blazor, proxy, static files, StoryFrame
src/angular-demo/               Angular gallery
src/angular-storybook/          Angular Storybook (HTML renderer + app frames)
src/blazor-storybook/           Blazor Storybook (manager + component frames)
src/visual-tests/               pixel-by-pixel regression check
```

## Pixel check

`src/visual-tests` screenshots the pages at 1280×900 and compares them with the committed
baselines using pixelmatch:

```bash
cd src/visual-tests
npm install
DEMO_ORIGIN=http://localhost:5080 npm run check    # exit 1 on any changed pixel
DEMO_ORIGIN=http://localhost:5080 npm run update   # after an intended visual change
```

It is a regression check, not a design review. The baselines are machine-specific (font
rasterisation), so regenerate them on a new machine.

## Commands

```bash
docker compose logs -f host      # host logs
docker compose logs -f auth      # gotrue logs
bash scripts/down.sh             # stop and remove the containers
```

The demo is not a template for production: the gotrue instance is disposable, the anon key is
printed by `/config.json`, and the database is a tmpfs.
