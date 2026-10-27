import type { Meta, StoryObj } from '@storybook/html-vite';

/**
 * Landing story for the documentation build. It is static on purpose: it must render on GitHub
 * Pages, where the .NET host (and the Blazor component frames) do not exist.
 */
const meta = {
  title: 'AuthKit/Introduction',
  render: () => `
    <div style="max-width:760px;margin:0 auto;padding:32px 24px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111827;line-height:1.6">
      <p style="margin:0 0 8px;color:#0b5cad;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">
        AuthKit · documentação
      </p>
      <h1 style="margin:0 0 12px;font-size:30px;letter-spacing:-.02em">Componentes AuthKit para Supabase</h1>
      <p style="margin:0 0 20px;color:#5b6472;font-size:15px">
        Esta é a versão estática do Storybook. As stories Angular correm com um provider em memória,
        sem rede. As stories Blazor precisam do host .NET e ficam disponíveis na demo Docker.
      </p>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:24px 0">
        <a href="../angular/" style="display:block;padding:18px 20px;border:1px solid #e2e6ee;border-radius:12px;text-decoration:none;color:inherit;background:#fff">
          <strong style="display:block;margin-bottom:6px">Galeria Angular</strong>
          <span style="color:#5b6472;font-size:13px">Os componentes no browser, com o provider desativado quando não há Supabase.</span>
        </a>
        <a href="https://github.com/carloshenriquecarniatto/AuthKit.Demo" style="display:block;padding:18px 20px;border:1px solid #e2e6ee;border-radius:12px;text-decoration:none;color:inherit;background:#fff">
          <strong style="display:block;margin-bottom:6px">Repositório</strong>
          <span style="color:#5b6472;font-size:13px">Docker, Supabase local, Blazor, Angular e o Storybook completo.</span>
        </a>
      </div>
      <div style="padding:14px 16px;border:1px solid #cfe0f3;background:#eef4fb;border-radius:10px;color:#0b5cad;font-size:13px">
        Para a demo interativa completa: <code style="background:#fff;padding:2px 5px;border-radius:4px">bash scripts/up.sh</code>
        e abrir <code style="background:#fff;padding:2px 5px;border-radius:4px">http://localhost:5080</code>.
      </div>
    </div>`,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
