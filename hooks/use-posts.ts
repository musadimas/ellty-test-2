"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePostCache } from "@/store/post-cache";
import { useEffect } from "react";
import { fetchPosts } from "@/lib/prefetch";

export interface Post {
  id: string;
  value: number;
  operation: string | null;
  authorId: string;
  createdAt: string;
  result: number;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    children: number;
  };
}

export interface PostsResponse {
  posts: Post[];
  nextCursor?: string;
}

export default function usePosts(id?: string) {
  const cache = usePostCache();

  const query = useInfiniteQuery({
    queryKey: ["posts", id ?? null],
    queryFn: ({ pageParam }: { pageParam?: string }) => fetchPosts({ pageParam, id }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: Infinity, // Never refetch if in cache
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Sync React Query data to Zustand normalized cache
  useEffect(() => {
    if (query.data) {
      const allPosts = query.data.pages.flatMap((page) => page.posts);
      const lastPage = query.data.pages[query.data.pages.length - 1];

      if (allPosts.length > 0) {
        if (id) {
          // Children posts
          cache.setChildren(id, allPosts, lastPage.nextCursor);
        } else {
          // Root posts
          cache.setRootPosts(allPosts, lastPage.nextCursor);
        }
      }
    }
  }, [query.data, id]);

  return query;
}

export function usePostFromCache(id: string) {
  return usePostCache((state: ReturnType<typeof usePostCache.getState>) => state.getPost(id));
}

export function useChildrenFromCache(parentId: string) {
  return usePostCache((state: ReturnType<typeof usePostCache.getState>) => state.getChildren(parentId));
}

export function useRootPostsFromCache() {
  return usePostCache((state: ReturnType<typeof usePostCache.getState>) => state.getRootPosts());
}

export function useHasPostInCache(id: string) {
  return usePostCache((state: ReturnType<typeof usePostCache.getState>) => state.hasPost(id));
}
