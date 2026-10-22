import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { AuthKitEmailComponent, AUTH_PROVIDER } from '@authkit/angular';
import { StoryAuthProvider } from './story-provider';

const meta = {
  title: 'Angular/AuthKitEmail',
  component: AuthKitEmailComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: AUTH_PROVIDER, useFactory: () => new StoryAuthProvider() }],
    }),
  ],
  args: {
    showConfirmPasswordField: false,
    prefilledEmail: '',
    prefilledPassword: '',
    redirectTo: null,
  },
  argTypes: {
    showConfirmPasswordField: { control: 'boolean' },
    prefilledEmail: { control: 'text' },
    prefilledPassword: { control: 'text' },
    redirectTo: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Email and password. The provider is a deterministic in-memory stub: password shorter than 8 characters fails with `weak_password`.',
      },
    },
  },
} satisfies Meta<AuthKitEmailComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: { prefilledEmail: 'ada@example.com' },
};

export const SignUpWithConfirmation: Story = {
  args: { showConfirmPasswordField: true },
};
