"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

export interface Post {
  id: string;
  value: number;
  operation: string | null;
  authorId: string;
  createdAt: string;
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

async function fetchPosts({ pageParam, id }: { pageParam?: string; id?: string }): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);

  const url = id ? `/api/posts/${id}/children?${params.toString()}` : `/api/posts?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export default function usePosts(id?: string) {
  return useInfiniteQuery({
    queryKey: ["posts", id ?? null],
    queryFn: ({ pageParam }: { pageParam?: string }) => fetchPosts({ pageParam, id }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
}
