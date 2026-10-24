import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface EmailArgs {
  prefilledEmail: string;
  redirectTo: string;
  showConfirmPasswordField: boolean;
  showForgotPassword: boolean;
  showSignUp: boolean;
  labels: Record<string, string>;
}

/**
 * The real `AuthKitEmail` from AuthKit.Blazor, embedded from the demo host. Sign-in works against
 * the local Supabase: the story is a live component, not a picture.
 *
 * Controls are component parameters: they change what the component renders, not the host's
 * startup configuration. `labels` overrides the catalog for this instance only.
 */
const meta = {
  title: 'Blazor/AuthKitEmail',
  render: (args: EmailArgs) => frame('email', args, 640),
  argTypes: {
    prefilledEmail: { control: 'text', description: 'E-mail shown when the form mounts' },
    redirectTo: { control: 'text', description: 'Return URL for e-mail confirmation' },
    showConfirmPasswordField: { control: 'boolean', description: 'Render the confirm-password field' },
    showForgotPassword: { control: 'boolean', description: 'Show the "forgot your password?" link' },
    showSignUp: { control: 'boolean', description: 'Show the sign-in/sign-up switch' },
    labels: {
      control: 'object',
      description: 'Per-instance message overrides, e.g. { "signIn": "Entrar agora" }',
    },
  },
  args: {
    prefilledEmail: '',
    redirectTo: '/callback',
    showConfirmPasswordField: false,
    showForgotPassword: true,
    showSignUp: true,
    labels: {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'Email and password. Renders only the flows declared by `IAuthProvider.Capabilities`; `ShowForgotPassword` and `ShowSignUp` remove the links, `Labels` overrides individual strings.',
      },
    },
  },
} satisfies Meta<EmailArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: { prefilledEmail: 'ada@example.com' },
};

export const WithConfirmation: Story = {
  args: { showConfirmPasswordField: true, prefilledEmail: 'ada@example.com' },
};

export const WithoutRecovery: Story = {
  args: { showForgotPassword: false, prefilledEmail: 'ada@example.com' },
};

export const CustomLabels: Story = {
  args: {
    prefilledEmail: 'ada@example.com',
    labels: {
      email: 'E-mail de cidadão',
      signIn: 'Entrar agora',
      dontHaveAccount: 'Ainda não estou registado',
    },
  },
};
