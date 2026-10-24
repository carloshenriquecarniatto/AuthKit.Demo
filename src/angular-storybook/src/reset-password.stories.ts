import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface ResetPasswordArgs {
  prefilledEmail: string;
  updateMode: boolean;
  labels: Record<string, string>;
}

const meta = {
  title: 'Angular/AuthKitResetPassword',
  render: (args: ResetPasswordArgs) => frame('reset-password', args, 560),
  argTypes: {
    prefilledEmail: { control: 'text' },
    updateMode: { control: 'boolean', description: 'Start on the new-password form' },
    labels: { control: 'object' },
  },
  args: { prefilledEmail: '', updateMode: false, labels: {} },
  parameters: {
    docs: {
      description: {
        component: 'Recovery request, or the new-password form when `updateMode` is set.',
      },
    },
  },
} satisfies Meta<ResetPasswordArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RequestRecovery: Story = {};

export const SetNewPassword: Story = {
  args: { updateMode: true, prefilledEmail: 'ada@example.com' },
};
