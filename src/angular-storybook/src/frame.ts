/**
 * The Angular gallery renders the story in `/angular/?story=<component>&<args>`; the dev server on
 * 6007 points at the demo on :5080, and the host build uses a relative URL.
 */
const HOST = window.location.port === '6007' ? 'http://localhost:5080' : '';

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

  return `<iframe src="${HOST}/angular/?${query}" style="width:100%;height:${height}px;border:0;background:#f4f6fb" title="Angular ${component}"></iframe>`;
}
