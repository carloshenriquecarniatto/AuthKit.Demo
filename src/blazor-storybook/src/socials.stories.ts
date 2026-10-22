import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

const meta = {
  title: 'Blazor/AuthKitSocials',
  render: () => frame('socials', {}, 420),
  parameters: {
    docs: {
      description: {
        component:
          'One button per provider declared by the host. OAuth is not configured in the local stack, so these buttons demonstrate rendering and error handling only.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
