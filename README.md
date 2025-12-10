# sleekcms-react

React bindings for [SleekCMS](https://sleekcms.com) - A headless CMS that makes content management simple and developer-friendly.

## Installation

```bash
npm install sleekcms-react
```

## Quick Start

### 1. Wrap Your App with SleekCMSProvider

```tsx
import { SleekCMSProvider } from 'sleekcms-react';

function App() {
  return (
    <SleekCMSProvider siteToken="your-site-token">
      <YourApp />
    </SleekCMSProvider>
  );
}
```

### 2. Fetch Content with Hooks

```tsx
import { useCmsContent } from 'sleekcms-react';

function BlogPost() {
  const { data, isLoading, error } = useCmsContent('blog/my-first-post');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading content</div>;

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

## API Reference

### `<SleekCMSProvider>`

Provides SleekCMS client to your React application.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `siteToken` | `string` | Yes* | Your SleekCMS site token |
| `client` | `SleekClient` | No | Pre-configured client instance (alternative to siteToken) |
| `sync` | `boolean` | No | Use sync client for instant, always-available content (default: `false`) |
| `env` | `string` | No | Environment (e.g., 'development', 'production') |
| `cache` | `boolean` | No | Enable caching |
| `mock` | `boolean` | No | Use mock data for testing |

*Either `siteToken` or `client` must be provided.

#### Example with Options

```tsx
<SleekCMSProvider 
  siteToken="your-site-token"
  env="production"
  cache={true}
>
  <App />
</SleekCMSProvider>
```

#### Using Sync Mode

For instant content availability with no loading states, use sync mode. The sync client prefetches all content once during initialization, then all subsequent reads are synchronous and in-memory:

```tsx
<SleekCMSProvider 
  siteToken="your-site-token"
  sync={true}
>
  <App />
</SleekCMSProvider>
```

**Benefits of Sync Mode:**
- ✨ Content is always instantly available (no loading states after initialization)
- ⚡ All operations are synchronous and in-memory
- 🎯 Perfect for static sites or when you want guaranteed content availability
- 🚀 Great for SSR/SSG scenarios

**Note:** The provider will briefly show `null` during initial sync client setup. After initialization, all hook calls return data immediately without loading states.

### Hooks

All hooks return the same result structure:

```tsx
{
  data: T | undefined;       // The fetched data
  error: unknown;            // Error if request failed
  isLoading: boolean;        // Loading state
  status: 'idle' | 'loading' | 'success' | 'error';
  refetch: () => Promise<void>; // Manually refetch data
}
```

#### `useCmsContent(query?, options?)`

Fetch any content from your CMS by path.

**Parameters:**
- `query` (optional): Content path/query string
- `options.enabled` (optional): Enable/disable the query (default: `true`)

#### `useCmsPages(path, query?, options?)`

Query pages with filters.

**Parameters:**
- `path`: Base path for pages (e.g., `'blog'`, `'products'`)
- `query` (optional): Query string for filtering/sorting
- `options.enabled` (optional): Enable/disable the query (default: `true`)

#### `useCmsImages(options?)`

Get all images from your media library.

**Parameters:**
- `options.enabled` (optional): Enable/disable the query (default: `true`)

#### `useCmsImage(name, options?)`

Get a specific image by name.

**Parameters:**
- `name`: Image filename
- `options.enabled` (optional): Enable/disable the query (default: `true`)

#### `useCmsList(name, options?)`

Get structured data lists (categories, tags, etc.).

**Parameters:**
- `name`: List name
- `options.enabled` (optional): Enable/disable the query (default: `true`)

## Usage Examples

### Fetch Content

Get any content from your CMS by path.

```tsx
import { useCmsContent } from 'sleekcms-react';

function HomePage() {
  const { data, isLoading } = useCmsContent('homepage');

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{data.hero.title}</h1>
      <p>{data.hero.subtitle}</p>
    </div>
  );
}
```

### Fetch Pages

Query pages with filters.

```tsx
import { useCmsPages } from 'sleekcms-react';

function BlogList() {
  const { data, isLoading } = useCmsPages('blog', 'status=published&sort=-date');

  if (isLoading) return <p>Loading posts...</p>;

  return (
    <div>
      {data.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Fetch Images

Get all images from your media library.

```tsx
import { useCmsImages } from 'sleekcms-react';

function Gallery() {
  const { data: images, isLoading } = useCmsImages();

  if (isLoading) return <p>Loading images...</p>;

  return (
    <div className="gallery">
      {images.map((image) => (
        <img key={image.name} src={image.url} alt={image.name} />
      ))}
    </div>
  );
}
```

### Fetch Single Image

Get a specific image by name.

```tsx
import { useCmsImage } from 'sleekcms-react';

function Hero() {
  const { data: image, isLoading } = useCmsImage('hero-background.jpg');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div 
      style={{ backgroundImage: `url(${image.url})` }}
      className="hero"
    >
      <h1>Welcome</h1>
    </div>
  );
}
```

### Fetch Lists

Get structured data lists (like categories, tags, etc.).

```tsx
import { useCmsList } from 'sleekcms-react';

function Categories() {
  const { data: categories, isLoading } = useCmsList('categories');

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}
```

### Conditional Fetching

Control when data is fetched using the `enabled` option.

```tsx
import { useCmsContent } from 'sleekcms-react';

function UserProfile({ userId }) {
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, isLoading } = useCmsContent(
    `users/${userId}`,
    { enabled: shouldFetch && !!userId }
  );

  return (
    <div>
      <button onClick={() => setShouldFetch(true)}>
        Load Profile
      </button>
      {isLoading && <p>Loading...</p>}
      {data && <div>{data.name}</div>}
    </div>
  );
}
```

### Manual Refetch

Trigger a manual refetch of data.

```tsx
import { useCmsContent } from 'sleekcms-react';

function RefreshableContent() {
  const { data, isLoading, refetch } = useCmsContent('live-data');

  return (
    <div>
      <button onClick={() => refetch()}>
        Refresh
      </button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
```

### TypeScript Support

Add type safety to your content.

```tsx
import { useCmsContent } from 'sleekcms-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
}

function TypedBlogPost() {
  const { data, isLoading } = useCmsContent<BlogPost>('blog/my-post');

  if (isLoading) return <p>Loading...</p>;

  return (
    <article>
      <h1>{data.title}</h1>
      <p>By {data.author}</p>
      <div>{data.content}</div>
    </article>
  );
}
```

### Sync Mode Example

With sync mode, content is prefetched once and always available synchronously:

```tsx
import { SleekCMSProvider, useCmsContent } from 'sleekcms-react';

function App() {
  return (
    <SleekCMSProvider siteToken="your-site-token" sync={true}>
      <HomePage />
    </SleekCMSProvider>
  );
}

function HomePage() {
  // No loading state needed - data is instantly available!
  const { data } = useCmsContent('homepage');

  return (
    <div>
      <h1>{data.hero.title}</h1>
      <p>{data.hero.subtitle}</p>
    </div>
  );
}
```

### Using with Next.js

```tsx
// app/layout.tsx
import { SleekCMSProvider } from 'sleekcms-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SleekCMSProvider siteToken={process.env.NEXT_PUBLIC_SLEEKCMS_TOKEN}>
          {children}
        </SleekCMSProvider>
      </body>
    </html>
  );
}

// app/page.tsx
'use client';

import { useCmsContent } from 'sleekcms-react';

export default function Home() {
  const { data, isLoading } = useCmsContent('homepage');

  if (isLoading) return <div>Loading...</div>;

  return <h1>{data.title}</h1>;
}
```

#### Next.js with Sync Mode

```tsx
// app/layout.tsx
'use client';

import { SleekCMSProvider } from 'sleekcms-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SleekCMSProvider 
          siteToken={process.env.NEXT_PUBLIC_SLEEKCMS_TOKEN}
          sync={true}
        >
          {children}
        </SleekCMSProvider>
      </body>
    </html>
  );
}

// app/page.tsx
'use client';

import { useCmsContent } from 'sleekcms-react';

export default function Home() {
  const { data } = useCmsContent('homepage');
  // No loading check needed in sync mode!
  
  return <h1>{data.title}</h1>;
}
```

## Error Handling

```tsx
import { useCmsContent } from 'sleekcms-react';

function SafeContent() {
  const { data, error, isLoading, status } = useCmsContent('my-content');

  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    console.error('Failed to load content:', error);
    return <div>Something went wrong. Please try again later.</div>;
  }

  return <div>{data.title}</div>;
}
```

## Advanced: Custom Client

For more control, create a client instance separately.

```tsx
import { createClient } from 'sleekcms-client';
import { SleekCMSProvider } from 'sleekcms-react';

const sleekClient = createClient({
  siteToken: 'your-site-token',
  cache: true,
  env: 'production'
});

function App() {
  return (
    <SleekCMSProvider client={sleekClient}>
      <YourApp />
    </SleekCMSProvider>
  );
}
```

## Getting Your Site Token

1. Sign up at [SleekCMS](https://sleekcms.com)
2. Create a new site
3. Find your site token in the site settings
4. Add it to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_SLEEKCMS_TOKEN=your-site-token
```

## License

MIT

## Support

- Documentation: [https://sleekcms.com/docs](https://sleekcms.com/docs)
- Issues: [GitHub Issues](https://github.com/sleekcms/sleekcms-react/issues)
- Email: support@sleekcms.com
