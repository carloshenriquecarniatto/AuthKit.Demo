import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface EmailArgs {
  prefilledEmail: string;
  showConfirmPasswordField: boolean;
  showForgotPassword: boolean;
  showSignUp: boolean;
  labels: Record<string, string>;
}

/**
 * The real `ak-email` from `@authkit/angular`, rendered by the gallery in story mode with the app's
 * Supabase provider. Every control is a component input; changing one reloads the frame, so what
 * you see is what the component renders.
 */
const meta = {
  title: 'Angular/AuthKitEmail',
  render: (args: EmailArgs) => frame('email', args, 640),
  argTypes: {
    prefilledEmail: { control: 'text' },
    showConfirmPasswordField: { control: 'boolean' },
    showForgotPassword: { control: 'boolean', description: 'Show the "forgot your password?" link' },
    showSignUp: { control: 'boolean', description: 'Show the sign-in/sign-up switch' },
    labels: { control: 'object', description: 'Per-instance message overrides' },
  },
  args: {
    prefilledEmail: '',
    showConfirmPasswordField: false,
    showForgotPassword: true,
    showSignUp: true,
    labels: {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'Email and password. `showForgotPassword` and `showSignUp` remove the links; `labels` overrides individual strings for this instance only.',
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

export const WithoutRecovery: Story = {
  args: { showForgotPassword: false, prefilledEmail: 'ada@example.com' },
};

export const WithoutSignUp: Story = {
  args: { showSignUp: false },
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
