import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

const meta = {
  title: 'Blazor/AuthKitResetPassword',
  render: () => frame('reset-password', {}, 520),
  parameters: {
    docs: {
      description: {
        component: 'Recovery request. `UpdateMode` turns the same component into the new-password form.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
