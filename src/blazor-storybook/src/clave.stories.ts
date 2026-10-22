import type { Meta, StoryObj } from '@storybook/html-vite';
import { frame } from './frame';

interface ClaveArgs {
  methods: string;
  level: '' | 'substantial' | 'high';
  showLevels: boolean;
  returnUrl: string;
}

/**
 * `AuthKitClave` is descriptor-driven: the controls below change the descriptor, not a hardcoded
 * list inside the component.
 */
const meta = {
  title: 'Blazor/AuthKitClave',
  render: (args: ClaveArgs) => frame('clave', args, 560),
  argTypes: {
    methods: { control: 'text', description: 'Comma-separated method ids' },
    level: {
      control: 'select',
      options: ['', 'substantial', 'high'],
      description: 'Forces a level; empty shows the selector',
    },
    showLevels: { control: 'boolean', description: 'Render the level selector' },
    returnUrl: { control: 'text' },
  },
  args: {
    methods: 'clave_movil,clave_permanente,certificate',
    level: '',
    showLevels: true,
    returnUrl: '/blazor',
  },
  parameters: {
    docs: {
      description: {
        component:
          'One control per declared method. The federation runs against the local signed stub; a valid identity returns to the host, which owns the session.',
      },
    },
  },
} satisfies Meta<ClaveArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighOnly: Story = {
  args: { level: 'high', methods: 'certificate' },
};

export const MobileOnly: Story = {
  args: { methods: 'clave_movil', showLevels: false },
};
