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

export function useContent<T = SleekSiteContent>(query?: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getContent(query) as Promise<T>, [query], options);
}

export function usePages<T = Pages>(path: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getPages(path) as Promise<T>, [path], options);
}

export function usePage<T = Page | null>(path: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getPage(path) as Promise<T>, [path], options);
}

export function useSlugs<T = string[]>(path: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getSlugs(path) as Promise<T>, [path], options);
}

export function useImage<T = Image | null>(name: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getImage(name) as Promise<T>, [name], options);
}

export function useList<T = List | null>(name: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getList(name) as Promise<T>, [name], options);
}

export function useEntry<T = Entry | null>(handle: string, options?: ClientOptions): Result<T> {
  return useFetch(client => client.getEntry(handle) as Promise<T>, [handle], options);
}

export type { ClientOptions, SyncCacheAdapter, AsyncCacheAdapter };
