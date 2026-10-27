/**
 * The story frames live in the Angular gallery. Their root depends on where the site is served:
 * `/` on the demo host, `/AuthKit.Demo/` on GitHub Pages, and `http://localhost:5080/` when the
 * Storybook dev server runs on 6007.
 */
const DEV = window.location.port === '6007';
const ROOT = DEV ? 'http://localhost:5080/' : window.location.pathname.replace(/\/storybook\/.*$/, '/');

export function frame(
  component: string,
  args: Record<string, string | boolean | readonly string[] | Record<string, string> | undefined>,
  height = 640,
): string {
  const query = new URLSearchParams({ story: component });
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === '') {
      continue;
    }

    query.set(
      key,
      Array.isArray(value)
        ? value.join(',')
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value),
    );
  }

  return `<iframe src="${ROOT}angular/?${query}" style="width:100%;height:${height}px;border:0;background:#f4f6fb" title="Angular ${component}"></iframe>`;
}
