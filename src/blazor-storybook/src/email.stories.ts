import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

/**
 * The real `AuthKitEmail` from AuthKit.Blazor, embedded from the demo host. Sign-in works against
 * the local Supabase: the story is a live component, not a picture.
 */
const meta = {
  title: 'Blazor/AuthKitEmail',
  render: () => frame('email', {}, 700),
  parameters: {
    docs: {
      description: {
        component:
          'Email and password. Renders only the flows declared by `IAuthProvider.Capabilities`.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
