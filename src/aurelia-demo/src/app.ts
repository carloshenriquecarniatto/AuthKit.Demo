import { CustomElement } from 'aurelia';
import template from './app.html?raw';
import { ClavePanelElement } from './components/clave-panel';
import { ConfigSectionElement } from './components/config-section';
import { SessionPanelElement } from './components/session-panel';
import { DemoRuntime } from './runtime-config';

/**
 * Root component. The SDK ships no components, so the shell is deliberately
 * thin: three sections, each one showing a different part of the plugin API.
 */
export class App {
  static inject = [DemoRuntime];

  readonly runtime: DemoRuntime;
  readonly returnUrl = import.meta.env.BASE_URL;

  constructor(runtime: DemoRuntime) {
    this.runtime = runtime;
  }
}

// `CustomElement.define` instead of a decorator: the demo follows the SDK's
// tsconfig (standard decorators) while esbuild/Vite only transpiles legacy
// decorators, so plain definitions avoid the mismatch entirely.
export const AppElement = CustomElement.define(
  {
    name: 'ak-app',
    template,
    dependencies: [SessionPanelElement, ClavePanelElement, ConfigSectionElement],
  },
  App,
);
