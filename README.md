# @sleekcms/react

React hooks for fetching content from [SleekCMS](https://sleekcms.com).

## Installation

```bash
npm install @sleekcms/react
```

Requires React 18+.

## Quick Start

Wrap your app with the provider:

```tsx
import { SleekCMSProvider } from '@sleekcms/react';

<SleekCMSProvider siteToken="your-site-token">
  <App />
</SleekCMSProvider>
```

Fetch content with hooks:

```tsx
import { usePage } from '@sleekcms/react';

function About() {
  const { data, loading, error } = usePage('/about');
  if (loading) return <p>Loading...</p>;
  return <h1>{data?.title}</h1>;
}
```

### Using Hooks Without a Provider

You can also use hooks without wrapping your app in a provider by passing client options directly to the hook:

```tsx
import { usePage } from '@sleekcms/react';

function About() {
  const { data, loading } = usePage('/about', { siteToken: 'your-site-token' });
  if (loading) return <p>Loading...</p>;
  return <h1>{data?.title}</h1>;
}
```

This is useful for one-off fetches or when you can't use a provider.

## Sync vs Async Client

SleekCMS offers two client types in `@sleekcms/client`:

| Client | Use Case |
|--------|----------|
| **Sync** (`createSyncClient`) | Server-side rendering, build-time. Preload content, then access synchronously. |
| **Async** (`createAsyncClient`) | Client-side React apps. Fetches on demand, returns Promises. |

**This package (`@sleekcms/react`) uses the async client internally.** The hooks handle fetching, loading states, and refetching automatically—ideal for React SPAs and client components.

For SSR/SSG (Next.js, Remix), use `@sleekcms/client` directly with the sync client to fetch content at build time or on the server.

## Hooks

All hooks return `{ data, loading, error, refetch }`.

### useContent

Fetch the full site content, optionally filtered with a [JMESPath](https://jmespath.org/) query:

```tsx
const { data } = useContent();           // full content
const { data } = useContent('config');   // just config
```

### usePage / usePages

```tsx
const { data } = usePage('/about');      // single page
const { data } = usePages('/blog');      // all pages under /blog
```

### useSlugs

Get slugs for dynamic routes:

```tsx
const { data } = useSlugs('/blog');      // ['post-1', 'post-2']
```

### useImage / useList / useEntry

```tsx
const { data } = useImage('logo');       // { url, alt, ... }
const { data } = useList('categories');  // [{ label, value }, ...]
const { data } = useEntry('header');     // { heading, body, ... }
```

## Provider Options

```tsx
<SleekCMSProvider
  siteToken="your-site-token"  // required
  env="staging"                // optional: environment alias
  cdn={true}                   // optional: use CDN URLs
  lang="es"                    // optional: language code
  cache={localStorage}         // optional: cache adapter
  cacheMinutes={60}            // optional: cache expiration in minutes
>
```

## Caching

The provider supports custom cache adapters to reduce API calls and improve performance. Any object with `getItem` and `setItem` methods works as a cache adapter.

### Using localStorage

```tsx
<SleekCMSProvider 
  siteToken="your-site-token"
  cache={localStorage}
  cacheMinutes={60*24}  // Cache expires after 1 day
>
  <App />
</SleekCMSProvider>
```

### Custom Cache Adapter

```tsx
import type { SyncCacheAdapter, AsyncCacheAdapter } from '@sleekcms/react';

// Sync adapter
const myCache: SyncCacheAdapter = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
};

// Async adapter (e.g., IndexedDB, remote cache)
const myAsyncCache: AsyncCacheAdapter = {
  getItem: async (key) => /* ... */,
  setItem: async (key, value) => /* ... */,
};
```

If `cacheMinutes` is not set, cached content never expires.

## License

MIT
