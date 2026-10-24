import type { StorybookConfig } from '@storybook/html-vite';

/**
 * The Angular gallery exposes a story mode: `/angular/?story=email&…` renders one real component
 * with the app's providers, no shell. The stories embed that page in an iframe and turn their
 * controls into query parameters.
 *
 * This is deliberately not the `@storybook/angular` renderer: that renderer mounts a wrapper whose
 * arguments do not reach the component when a custom template is used, so controls looked live but
 * changed nothing. A fresh iframe per args change runs the same code the gallery runs.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
