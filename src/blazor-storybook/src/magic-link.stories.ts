import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

const meta = {
  title: 'Blazor/AuthKitMagicLink',
  render: () => frame('magic-link', {}, 520),
  parameters: {
    docs: {
      description: {
        component: 'Passwordless link. The email lands in Mailpit while the demo stack is running.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
