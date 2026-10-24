import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface ResetArgs {
  prefilledEmail: string;
  redirectTo: string;
  updateMode: boolean;
  labels: Record<string, string>;
}

const meta = {
  title: 'Blazor/AuthKitResetPassword',
  render: (args: ResetArgs) => frame('reset-password', args, 560),
  argTypes: {
    prefilledEmail: { control: 'text' },
    redirectTo: { control: 'text' },
    updateMode: { control: 'boolean', description: 'Turn the recovery request into the new-password form' },
    labels: { control: 'object' },
  },
  args: {
    prefilledEmail: '',
    redirectTo: '/callback',
    updateMode: false,
    labels: {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'Recovery request. `UpdateMode` turns the same component into the new-password form that the recovery link lands on.',
      },
    },
  },
} satisfies Meta<ResetArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RequestRecovery: Story = {};

export const SetNewPassword: Story = {
  args: { updateMode: true, prefilledEmail: 'ada@example.com' },
};
