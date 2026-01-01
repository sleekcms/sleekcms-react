import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

function useClient(): AsyncClient {
  const client = useContext(Context);
  if (!client) throw new Error("Wrap your app with <SleekCMSProvider>");
  return client;
}

function useFetch<T>(fetcher: (client: AsyncClient) => Promise<T>, deps: unknown[]): Result<T> {
  const client = useClient();
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

export function useContent(query?: string): Result<SleekSiteContent> {
  return useFetch(client => client.getContent(query), [query]);
}

export function usePages(path: string): Result<Pages> {
  return useFetch(client => client.getPages(path), [path]);
}

export function usePage(path: string): Result<Page | null> {
  return useFetch(client => client.getPage(path), [path]);
}

export function useSlugs(path: string): Result<string[]> {
  return useFetch(client => client.getSlugs(path), [path]);
}

export function useImage(name: string): Result<Image | null> {
  return useFetch(client => client.getImage(name), [name]);
}

export function useList(name: string): Result<List | null> {
  return useFetch(client => client.getList(name), [name]);
}

export function useEntry(handle: string): Result<Entry | null> {
  return useFetch(client => client.getEntry(handle), [handle]);
}

export type { ClientOptions, SyncCacheAdapter, AsyncCacheAdapter };
