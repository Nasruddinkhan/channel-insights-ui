export async function fetchJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${import.meta.env.BASE_URL}assets/${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Unable to load request data (HTTP ${response.status}). Please retry.`);
  }
  const data: unknown = await response.json();
  if (new URLSearchParams(location.search).has('demoError') && !sessionStorage.getItem('retried')) {
    throw new Error('The demo service is temporarily unavailable.');
  }
  return data;
}
