// Only same-site paths: "//evil.com" or "https://evil.com" would be an open redirect
export function safeRedirect(target: string | string[] | undefined, fallback = '/events'): string {
  if (typeof target !== 'string') return fallback;
  return target.startsWith('/') && !target.startsWith('//') ? target : fallback;
}
