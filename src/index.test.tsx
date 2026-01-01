/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { SleekCMSProvider, useContent, usePages, usePage, useSlugs, useImage, useList, useEntry } from "./index";

const mockContent = { config: { title: "Test Site" } };
const mockPages = [{ _path: "/blog/post-1", title: "Post 1" }, { _path: "/blog/post-2", title: "Post 2" }];
const mockPage = { _path: "/about", title: "About Us" };
const mockSlugs = ["post-1", "post-2", "post-3"];
const mockImage = { url: "https://example.com/logo.png", alt: "Logo" };
const mockList = [{ label: "Tech", value: "tech" }, { label: "News", value: "news" }];
const mockEntry = { heading: "Welcome", body: "Hello world" };

vi.mock("@sleekcms/client", () => ({
  createAsyncClient: () => ({
    getContent: vi.fn().mockResolvedValue(mockContent),
    getPages: vi.fn().mockResolvedValue(mockPages),
    getPage: vi.fn().mockResolvedValue(mockPage),
    getSlugs: vi.fn().mockResolvedValue(mockSlugs),
    getImage: vi.fn().mockResolvedValue(mockImage),
    getList: vi.fn().mockResolvedValue(mockList),
    getEntry: vi.fn().mockResolvedValue(mockEntry),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <SleekCMSProvider siteToken="test-token">{children}</SleekCMSProvider>
);

describe("useContent", () => {
  it("fetches content and returns data", async () => {
    const { result } = renderHook(() => useContent(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockContent);
    expect(result.current.error).toBeUndefined();
  });

  it("throws error when used outside provider without options", () => {
    expect(() => renderHook(() => useContent())).toThrow(
      "Provide client options or wrap your app with <SleekCMSProvider>"
    );
  });

  it("works without provider when options are passed", async () => {
    const { result } = renderHook(() => useContent(undefined, { siteToken: "test-token" }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockContent);
    expect(result.current.error).toBeUndefined();
  });
});

describe("usePages", () => {
  it("fetches pages and returns data", async () => {
    const { result } = renderHook(() => usePages("/blog"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockPages);
    expect(result.current.error).toBeUndefined();
  });
});

describe("usePage", () => {
  it("fetches a single page and returns data", async () => {
    const { result } = renderHook(() => usePage("/about"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockPage);
    expect(result.current.error).toBeUndefined();
  });
});

describe("useSlugs", () => {
  it("fetches slugs and returns data", async () => {
    const { result } = renderHook(() => useSlugs("/blog"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockSlugs);
    expect(result.current.error).toBeUndefined();
  });
});

describe("useImage", () => {
  it("fetches an image and returns data", async () => {
    const { result } = renderHook(() => useImage("logo"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockImage);
    expect(result.current.error).toBeUndefined();
  });
});

describe("useList", () => {
  it("fetches a list and returns data", async () => {
    const { result } = renderHook(() => useList("categories"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockList);
    expect(result.current.error).toBeUndefined();
  });
});

describe("useEntry", () => {
  it("fetches an entry and returns data", async () => {
    const { result } = renderHook(() => useEntry("header"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEntry);
    expect(result.current.error).toBeUndefined();
  });
});
