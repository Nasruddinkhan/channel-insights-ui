import { useCallback, useEffect, useState } from 'react';

export interface HttpState<T> {
  data: T | undefined;
  loading: boolean;
  error: string;
}

/** Memoize request with useCallback; changing it cancels and replaces the request. */
export function useHttp<T>(request: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<HttpState<T>>({ data: undefined, loading: true, error: '' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: undefined, loading: true, error: '' });
    async function execute() {
      try {
        const data = await request(controller.signal);
        if (!controller.signal.aborted) setState({ data, loading: false, error: '' });
      } catch (reason: unknown) {
        if (controller.signal.aborted) return;
        const fallbackMessage = 'Unable to load data. Please retry.';
        const error = reason instanceof Error ? reason.message || fallbackMessage : fallbackMessage;
        setState({ data: undefined, loading: false, error });
      }
    }
    void execute();
    return () => controller.abort();
  }, [request, attempt]);

  return { ...state, retry };
}
