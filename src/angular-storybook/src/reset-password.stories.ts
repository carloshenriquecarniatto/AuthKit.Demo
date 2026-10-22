import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { AuthKitResetPasswordComponent, AUTH_PROVIDER } from '@authkit/angular';
import { StoryAuthProvider } from './story-provider';

const meta = {
  title: 'Angular/AuthKitResetPassword',
  component: AuthKitResetPasswordComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: AUTH_PROVIDER, useFactory: () => new StoryAuthProvider() }],
    }),
  ],
  args: { prefilledEmail: '', redirectTo: null, updateMode: false },
  argTypes: {
    prefilledEmail: { control: 'text' },
    redirectTo: { control: 'text' },
    updateMode: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Recovery request. `updateMode` turns it into the new-password form.',
      },
    },
  },
} satisfies Meta<AuthKitResetPasswordComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RequestRecovery: Story = {};

export const SetNewPassword: Story = {
  args: { updateMode: true, prefilledEmail: 'ada@example.com' },
};
