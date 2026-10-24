/**
 * Storybook frames are embedded from the demo host, so a story is the real component running
 * against the real providers. Controls become query parameters: `StoryFrame.razor` reads them and
 * passes them to the component. No second implementation to drift.
 *
 * When Storybook is served by the demo host the frame is a relative URL (same origin); the dev
 * server on 6009 points at the demo on :5080.
 */
const HOST = window.location.port === '6009' ? 'http://localhost:5080' : '';

export function frame(
  component: string,
  args: Record<string, string | boolean | readonly string[] | Record<string, string> | undefined>,
  height = 560,
): string {
  const query = new URLSearchParams();
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

  return `<iframe src="${HOST}/storybook-frame/${component}?${query}" style="width:100%;height:${height}px;border:0;background:#f4f6fb" title="${component}"></iframe>`;
}
