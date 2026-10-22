import type { Preview } from '@storybook/angular';
import 'zone.js';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: { toc: true },
  },
};

export default preview;
