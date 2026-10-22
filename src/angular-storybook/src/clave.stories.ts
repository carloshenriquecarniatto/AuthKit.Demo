import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import {
  AuthKitClaveComponent,
  AUTH_PROVIDER,
  type AuthFederationProvider,
} from '@authkit/angular';
import { StoryAuthProvider } from './story-provider';

const providers: AuthFederationProvider[] = [
  {
    id: 'clave',
    kind: 'clave',
    displayName: 'Cl@ve',
    description: 'Federação eIDAS através do gateway de teste.',
    iconUrl: null,
    levels: ['substantial', 'high'],
    isPrimary: true,
    methods: [
      {
        id: 'clave_movil',
        displayName: 'Cl@ve Móvil',
        description: 'Notificação na app do cidadão',
        levels: ['substantial'],
        recommended: true,
      },
      {
        id: 'clave_permanente',
        displayName: 'Cl@ve Permanente',
        description: null,
        levels: ['substantial'],
        recommended: false,
      },
      {
        id: 'certificate',
        displayName: 'Certificado / DNIe',
        description: 'Permite nível high',
        levels: ['substantial', 'high'],
        recommended: false,
      },
    ],
  },
];

const meta = {
  title: 'Angular/AuthKitClave',
  component: AuthKitClaveComponent,
  decorators: [
    applicationConfig({
      providers: [{ provide: AUTH_PROVIDER, useFactory: () => new StoryAuthProvider() }],
    }),
  ],
  args: {
    providers,
    level: null,
    returnUrl: '/angular/',
    loginPath: '/clave/login',
    showLevelSelector: true,
  },
  argTypes: {
    level: { control: 'inline-radio', options: [null, 'substantial', 'high'] },
    returnUrl: { control: 'text' },
    loginPath: { control: 'text' },
    showLevelSelector: { control: 'boolean' },
    providers: { control: 'object' },
    navigate: { action: 'navigate' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Descriptor-driven: one control per declared method, level selector only when more than one level applies. `navigate` emits the host login URL; the component never navigates.',
      },
    },
  },
} satisfies Meta<AuthKitClaveComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighOnly: Story = {
  args: { level: 'high' },
};

export const MobileOnly: Story = {
  args: { providers: [{ ...providers[0]!, methods: [providers[0]!.methods[0]!] }], showLevelSelector: false },
};
