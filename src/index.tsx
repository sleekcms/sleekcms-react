import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { createAsyncClient, SleekSiteContent, Page, Image, List, Entry, ClientOptions, SyncCacheAdapter, AsyncCacheAdapter } from "@sleekcms/client";

type AsyncClient = ReturnType<typeof createAsyncClient>;
type Pages = SleekSiteContent["pages"];

interface ProviderProps extends ClientOptions {
  children: ReactNode;
}

interface Result<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  refetch: () => Promise<void>;
}

const Context = createContext<AsyncClient | null>(null);

function useClient(options?: ClientOptions): AsyncClient {
  const contextClient = useContext(Context);
  const standaloneClient = useMemo(
    () => options ? createAsyncClient(options) : null,
    [options]
  );

  const client = standaloneClient ?? contextClient;
  if (!client) throw new Error("Provide client options or wrap your app with <SleekCMSProvider>");
  return client;
}

function useFetch<T>(fetcher: (client: AsyncClient) => Promise<T>, deps: unknown[], options?: ClientOptions): Result<T> {
  const client = useClient(options);
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcher(client));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [client, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, error, loading, refetch };
}

export function SleekCMSProvider({ children, ...options }: ProviderProps) {
  const [client] = useState(() => createAsyncClient(options));
  return <Context.Provider value={client}>{children}</Context.Provider>;
}

export function useContent(query?: string, options?: ClientOptions): Result<SleekSiteContent> {
  return useFetch(client => client.getContent(query), [query], options);
}

export function usePages(path: string, options?: ClientOptions): Result<Pages> {
  return useFetch(client => client.getPages(path), [path], options);
}

export function usePage(path: string, options?: ClientOptions): Result<Page | null> {
  return useFetch(client => client.getPage(path), [path], options);
}

export function useSlugs(path: string, options?: ClientOptions): Result<string[]> {
  return useFetch(client => client.getSlugs(path), [path], options);
}

export function useImage(name: string, options?: ClientOptions): Result<Image | null> {
  return useFetch(client => client.getImage(name), [name], options);
}

export function useList(name: string, options?: ClientOptions): Result<List | null> {
  return useFetch(client => client.getList(name), [name], options);
}

export function useEntry(handle: string, options?: ClientOptions): Result<Entry | null> {
  return useFetch(client => client.getEntry(handle), [handle], options);
}

export type { ClientOptions, SyncCacheAdapter, AsyncCacheAdapter };
