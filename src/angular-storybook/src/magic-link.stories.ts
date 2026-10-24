import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface MagicLinkArgs {
  prefilledEmail: string;
  labels: Record<string, string>;
}

const meta = {
  title: 'Angular/AuthKitMagicLink',
  render: (args: MagicLinkArgs) => frame('magic-link', args, 520),
  argTypes: {
    prefilledEmail: { control: 'text' },
    labels: { control: 'object' },
  },
  args: { prefilledEmail: '', labels: {} },
  parameters: {
    docs: {
      description: {
        component: 'Passwordless sign-in link. The stub returns `confirm_email` without a network call.',
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
