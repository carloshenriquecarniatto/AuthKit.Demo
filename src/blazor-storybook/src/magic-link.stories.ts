import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface MagicLinkArgs {
  prefilledEmail: string;
  redirectTo: string;
  labels: Record<string, string>;
}

const meta = {
  title: 'Blazor/AuthKitMagicLink',
  render: (args: MagicLinkArgs) => frame('magic-link', args, 520),
  argTypes: {
    prefilledEmail: { control: 'text' },
    redirectTo: { control: 'text', description: 'Where the link returns to (Mailpit catches it)' },
    labels: { control: 'object', description: 'Per-instance message overrides' },
  },
  args: {
    prefilledEmail: '',
    redirectTo: '/callback',
    labels: {},
  },
  parameters: {
    docs: {
      description: {
        component: 'Passwordless link. The email lands in Mailpit while the demo stack is running.',
      },
    },
  },
} satisfies Meta<MagicLinkArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: { prefilledEmail: 'ada@example.com' },
};

export const CustomLabels: Story = {
  args: { labels: { email: 'E-mail de cidadão', magicLink: 'Enviar-me um link' } },
};
