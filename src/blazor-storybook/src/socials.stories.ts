import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface SocialsArgs {
  providers: string;
  colored: boolean;
  variant: 'icon' | 'icon-and-text';
  redirectTo: string;
  labels: Record<string, string>;
}

const meta = {
  title: 'Blazor/AuthKitSocials',
  render: (args: SocialsArgs) => frame('socials', args, 420),
  argTypes: {
    providers: { control: 'text', description: 'Comma-separated provider ids' },
    colored: { control: 'boolean', description: 'Use the provider brand colour' },
    variant: { control: 'inline-radio', options: ['icon', 'icon-and-text'] },
    redirectTo: { control: 'text' },
    labels: { control: 'object' },
  },
  args: {
    providers: 'github,google',
    colored: true,
    variant: 'icon-and-text',
    redirectTo: '/callback',
    labels: {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'One button per provider declared by the host. OAuth is not configured in the local stack, so these buttons demonstrate rendering and error handling only.',
      },
    },
  },
} satisfies Meta<SocialsArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IconOnly: Story = {
  args: { variant: 'icon' },
};

export const Uncoloured: Story = {
  args: { colored: false, providers: 'github,google,apple' },
};
