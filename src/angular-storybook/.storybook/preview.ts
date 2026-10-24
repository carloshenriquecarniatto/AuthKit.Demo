import type { Preview } from '@storybook/html-vite';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    docs: { toc: true },
  },
};

export default preview;
