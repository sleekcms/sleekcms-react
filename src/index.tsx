import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
} from "react";
import {
  createClient,
  createSyncClient,
  type ClientOptions,
  type SleekClient as AsyncClient,
  type SleekSyncClient,
} from "sleekcms-client";

export type SleekClient = AsyncClient | SleekSyncClient;

type Status = "idle" | "loading" | "success" | "error";

export interface UseSleekCmsResult<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  status: Status;
  refetch: () => Promise<void>;
}

export interface SleekCMSProviderProps extends Partial<ClientOptions> {
  client?: SleekClient;
  sync?: boolean;
  children: ReactNode;
}

const SleekCmsContext = createContext<SleekClient | null>(null);

export function SleekCMSProvider({
  client,
  siteToken,
  env,
  cache,
  mock,
  sync,
  children
}: SleekCMSProviderProps) {
  const [syncClient, setSyncClient] = useState<SleekSyncClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(sync || false);

  useEffect(() => {
    if (sync && !client && siteToken) {
      setIsInitializing(true);
      createSyncClient({ siteToken, env, cache, mock })
        .then((c) => {
          setSyncClient(c);
          setIsInitializing(false);
        })
        .catch((err) => {
          console.error("[SleekCMSProvider] Failed to create sync client:", err);
          setIsInitializing(false);
        });
    }
  }, [sync, client, siteToken, env, cache, mock]);

  const value = useMemo(() => {
    if (client) return client;
    if (sync && syncClient) return syncClient;
    if (sync && isInitializing) return null;
    if (!siteToken) {
      throw new Error(
        "[SleekCMSProvider] Either `client` or `siteToken` must be provided."
      );
    }
    return createClient({ siteToken, env, cache, mock });
  }, [client, sync, syncClient, isInitializing, siteToken, env, cache, mock]);

  if (sync && isInitializing) {
    return null;
  }

  return (
    <SleekCmsContext.Provider value={value}>
      {children}
    </SleekCmsContext.Provider>
  );
}

function useSleekClientFromContext(): SleekClient {
  const ctx = useContext(SleekCmsContext);
  if (!ctx) {
    throw new Error(
      "[useSleekCms] Missing SleekCMSProvider. Wrap your app with <SleekCMSProvider>."
    );
  }
  return ctx;
}

function useAsyncQuery<T>(
  fetcher: () => Promise<T>,
  enabled: boolean
): UseSleekCmsResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);
  const [status, setStatus] = useState<Status>("idle");

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setStatus("loading");
    setError(undefined);
    try {
      const result = await fetcher();
      setData(result);
      setStatus("success");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  }, [enabled, fetcher]);

  useEffect(() => {
    if (!enabled) return;
    refetch();
  }, [enabled, refetch]);

  return {
    data,
    error,
    isLoading: status === "loading",
    status,
    refetch
  };
}

export function useCmsContent<T = any>(
  query?: string,
  options?: { enabled?: boolean }
): UseSleekCmsResult<T> {
  const client = useSleekClientFromContext();
  const enabled = options?.enabled ?? true;

  const fetcher = useCallback(async (): Promise<T> => {
    const result = client.getContent<T>(query);
    return result instanceof Promise ? await result : result;
  }, [client, query]);

  return useAsyncQuery<T>(fetcher, enabled);
}

export function useCmsPages<T = any>(
  path: string,
  query?: string,
  options?: { enabled?: boolean }
): UseSleekCmsResult<T> {
  const client = useSleekClientFromContext();
  const enabled = options?.enabled ?? true;

  const fetcher = useCallback(async (): Promise<T> => {
    const result = client.findPages<T>(path, query);
    return result instanceof Promise ? await result : result;
  }, [client, path, query]);

  return useAsyncQuery<T>(fetcher, enabled);
}

export function useCmsImages<T = any>(
  options?: { enabled?: boolean }
): UseSleekCmsResult<T> {
  const client = useSleekClientFromContext();
  const enabled = options?.enabled ?? true;

  const fetcher = useCallback(async (): Promise<T> => {
    const result = client.getImages();
    return (result instanceof Promise ? await result : result) as T;
  }, [client]);

  return useAsyncQuery<T>(fetcher, enabled);
}

export function useCmsImage<T = any>(
  name: string,
  options?: { enabled?: boolean }
): UseSleekCmsResult<T> {
  const client = useSleekClientFromContext();
  const enabled = options?.enabled ?? true;

  const fetcher = useCallback(async (): Promise<T> => {
    const result = client.getImage(name);
    return (result instanceof Promise ? await result : result) as T;
  }, [client, name]);

  return useAsyncQuery<T>(fetcher, enabled);
}

export function useCmsList<T = any>(
  name: string,
  options?: { enabled?: boolean }
): UseSleekCmsResult<T> {
  const client = useSleekClientFromContext();
  const enabled = options?.enabled ?? true;

  const fetcher = useCallback(async (): Promise<T> => {
    const result = client.getList<T>(name);
    return (result instanceof Promise ? await result : result) as T;
  }, [client, name]);

  return useAsyncQuery<T>(fetcher, enabled);
}
