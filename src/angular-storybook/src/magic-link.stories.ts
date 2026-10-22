import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { AuthKitMagicLinkComponent, AUTH_PROVIDER } from '@authkit/angular';
import { StoryAuthProvider } from './story-provider';

const meta = {
  title: 'Angular/AuthKitMagicLink',
  component: AuthKitMagicLinkComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: AUTH_PROVIDER, useFactory: () => new StoryAuthProvider() }],
    }),
  ],
  args: { prefilledEmail: '', redirectTo: null },
  argTypes: {
    prefilledEmail: { control: 'text' },
    redirectTo: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Passwordless sign-in link. The stub returns `confirm_email` without a network call.',
      },
    },
  },
} satisfies Meta<AuthKitMagicLinkComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: { prefilledEmail: 'ada@example.com' },
};
