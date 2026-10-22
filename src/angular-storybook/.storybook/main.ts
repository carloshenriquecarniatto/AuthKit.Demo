import type { StorybookConfig } from '@storybook/angular';

/**
 * Angular uses the official Storybook renderer. The other two stacks appear as composed refs:
 * Aurelia and Blazor have no official renderer, so their Storybooks use the HTML renderer and embed
 * the real components from the demo apps.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  refs: {
    aurelia: { title: 'Aurelia', url: '/storybook/aurelia' },
    blazor: { title: 'Blazor', url: '/storybook/blazor' },
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
