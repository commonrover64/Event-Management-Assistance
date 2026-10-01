// The access token lives only in memory. localStorage would survive reloads,
// but any injected script could read it there.
let accessToken: string | null = null;

const expiryListeners = new Set<() => void>();

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

export function onSessionExpired(listener: () => void): () => void {
  expiryListeners.add(listener);
  return () => {
    expiryListeners.delete(listener);
  };
}

export function notifySessionExpired(): void {
  tokenStore.clear();
  expiryListeners.forEach((listener) => listener());
}
