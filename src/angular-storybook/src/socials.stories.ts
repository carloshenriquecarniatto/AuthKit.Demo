import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { AuthKitSocialsComponent, AUTH_PROVIDER } from '@authkit/angular';
import { StoryAuthProvider } from './story-provider';

const meta = {
  title: 'Angular/AuthKitSocials',
  component: AuthKitSocialsComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: AUTH_PROVIDER, useFactory: () => new StoryAuthProvider() }],
    }),
  ],
  args: { providers: ['github', 'google'], colored: true, variant: 'icon-and-text' },
  argTypes: {
    providers: { control: 'object' },
    colored: { control: 'boolean' },
    variant: { control: 'inline-radio', options: ['icon', 'icon-and-text', 'icon-text'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'One button per provider. The stub returns a dead URL: rendering is what is on show.',
      },
    },
  },
} satisfies Meta<AuthKitSocialsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IconOnly: Story = {
  args: { variant: 'icon', providers: ['github', 'google', 'apple'] },
};

export const Uncoloured: Story = {
  args: { colored: false },
};
