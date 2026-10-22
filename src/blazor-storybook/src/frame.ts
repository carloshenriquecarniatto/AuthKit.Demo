const HOST = 'http://localhost:5080';

/** Embeds a real component from the demo host; arguments become query parameters. */
export function frame(
  component: string,
  args: Record<string, string | boolean | undefined>,
  height = 560,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }

  return `<iframe src="${HOST}/storybook-frame/${component}?${query}" style="width:100%;height:${height}px;border:0;background:#f8fafc" title="${component}"></iframe>`;
}
