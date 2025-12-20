# @sleekcms/react

React bindings for [SleekCMS](https://sleekcms.com) using `@sleekcms/client`.

## Installation

```bash
npm install @sleekcms/react
```

## Quick Start

### 1. Wrap Your App

```tsx
import { SleekCMSProvider } from '@sleekcms/react';

function App() {
  return (
    <SleekCMSProvider siteToken="your-site-token">
      <YourApp />
    </SleekCMSProvider>
  );
}
```

### 2. Fetch Content

```tsx
import { useContent } from '@sleekcms/react';

function BlogPosts() {
  const { data, isLoading, error } = useContent(client => client.getPages('/blog'));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading content</div>;

  return data?.map(post => <article key={post._path}><h2>{post.title}</h2></article>);
}
```

## API

### `<SleekCMSProvider>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `siteToken` | `string` | Yes | Your SleekCMS site token |
| `env` | `string` | No | Environment/alias name |
| `cdn` | `boolean` | No | Use CDN-friendly URLs |
| `lang` | `string` | No | Language code (e.g., 'en', 'es') |

### `useContent<T>(fetcher)`

Generic hook that receives the async client and returns content.

```tsx
// Get a single page
const { data } = useContent(c => c.getPage('/about'));

// Get pages by path
const { data } = useContent(c => c.getPages('/blog'));

// Get an entry
const { data } = useContent(c => c.getEntry('header'));

// Get content with JMESPath query
const { data } = useContent(c => c.getContent('config.title'));

// Get an image
const { data } = useContent(c => c.getImage('logo'));

// Get a list
const { data } = useContent(c => c.getList('categories'));
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| undefined` | The fetched content |
| `error` | `unknown` | Error if request failed |
| `isLoading` | `boolean` | Loading state |
| `status` | `'idle' \| 'loading' \| 'success' \| 'error'` | Current status |
| `refetch` | `() => Promise<void>` | Refetch the content |

## License

MIT
