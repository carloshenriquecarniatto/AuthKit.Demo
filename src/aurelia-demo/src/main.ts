import { Aurelia, Registration } from 'aurelia';
import { HttpClient } from '@aurelia/fetch-client';
import { AuthKitConfiguration, AuthKitHttpClient } from '@authkit/aurelia2';
import { AppElement } from './app';
import { DEMO_AUDIENCE, DEMO_PROVIDERS } from './descriptors';
import { DemoRuntime, loadDemoRuntime } from './runtime-config';

/**
 * Order matters twice:
 * 1. `/config.json` is read before Aurelia starts, because the login path is a
 *    validated constructor argument of `AuthKitConfig`.
 * 2. `HttpClient` is registered before `AuthKitHttpClient`, which resolves
 *    `IHttpClient` at registration time to install the interceptor.
 */
async function bootstrap(): Promise<void> {
  const runtime = await loadDemoRuntime();

  const host = document.querySelector('ak-app');
  if (!(host instanceof HTMLElement)) {
    throw new Error('Elemento <ak-app> não encontrado em index.html.');
  }

  const aurelia = new Aurelia();
  aurelia.register(
    HttpClient,
    Registration.instance(DemoRuntime, runtime),
    AuthKitConfiguration.customize({
      baseUrl: window.location.origin,
      audience: DEMO_AUDIENCE,
      loginPath: runtime.config.claveLoginPath,
      providers: DEMO_PROVIDERS,
    }),
    AuthKitHttpClient,
  );

  aurelia.app({ host, component: AppElement });
  await aurelia.start();
}

function renderFatal(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error('AuthKit demo: falha ao arrancar a aplicação Aurelia.', error);

  const box = document.createElement('div');
  box.className = 'fatal';
  box.innerHTML =
    '<h1>Não foi possível arrancar a demo</h1>' +
    '<p>A aplicação Aurelia falhou antes do primeiro render. Abra a consola para o detalhe.</p>';
  const detail = document.createElement('code');
  detail.textContent = message;
  box.append(detail);

  document.body.replaceChildren(box);
}

void bootstrap().catch(renderFatal);
