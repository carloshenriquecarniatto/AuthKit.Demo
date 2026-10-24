import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface SocialsArgs {
  providers: readonly string[];
  colored: boolean;
  variant: 'icon' | 'icon-and-text';
  labels: Record<string, string>;
}

const meta = {
  title: 'Angular/AuthKitSocials',
  render: (args: SocialsArgs) => frame('socials', args, 420),
  argTypes: {
    providers: { control: 'object', description: 'Provider ids' },
    colored: { control: 'boolean' },
    variant: { control: 'inline-radio', options: ['icon', 'icon-and-text'] },
    labels: { control: 'object' },
  },
  args: {
    providers: ['github', 'google'],
    colored: true,
    variant: 'icon-and-text',
    labels: {},
  },
  parameters: {
    docs: {
      description: {
        component: 'One button per provider declared by the provider capabilities.',
      },
    },
  },
} satisfies Meta<SocialsArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IconOnly: Story = {
  args: { variant: 'icon', providers: ['github', 'google', 'apple'] },
};

export const Uncoloured: Story = {
  args: { colored: false },
};
