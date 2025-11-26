import { QueryClient } from "@tanstack/react-query";
import type { PostsResponse } from "@/hooks/use-posts";
import { usePostCache } from "@/store/post-cache";

function getBaseUrl() {
  // client environment
  if (typeof window !== "undefined") return "";

  // server environment
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  return "http://localhost:3000";
}

export async function fetchPosts({ pageParam, id }: { pageParam?: string; id?: string }): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);

  const baseUrl = getBaseUrl();
  const url = id ? `${baseUrl}/api/posts/${id}/children?${params.toString()}` : `${baseUrl}/api/posts?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// prefetch child posts for given parent ID **use cache first approach
export async function prefetchChildren(queryClient: QueryClient, parentId: string) {
  const cache = usePostCache.getState();

  //check data in cache
  const existingChildren = cache.getChildren(parentId);
  if (existingChildren.length > 0) {
    return;
  }

  // check if query has the data
  const existingData = queryClient.getQueryData<{ pages: PostsResponse[] }>(["posts", parentId]);
  if (existingData?.pages?.[0]?.posts?.length) {
    return;
  }

  // prefetch from server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["posts", parentId],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const data = await fetchPosts({ pageParam, id: parentId });

      // add to normalized cache
      if (data.posts.length > 0) {
        cache.setChildren(parentId, data.posts, data.nextCursor);
      }

      return data;
    },
    initialPageParam: undefined,
  });
}

// prefetch root posts for given parent ID **use cache first approach
export async function prefetchRootPosts(queryClient: QueryClient) {
  const cache = usePostCache.getState();

  //check data in cache
  const existingRoots = cache.getRootPosts();
  if (existingRoots.length > 0) {
    return;
  }

  // check if query has the data
  const existingData = queryClient.getQueryData<{ pages: PostsResponse[] }>(["posts", null]);
  if (existingData?.pages?.[0]?.posts?.length) {
    return;
  }

  // prefetch from server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["posts", null],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const data = await fetchPosts({ pageParam });

      // add to normalized cache
      if (data.posts.length > 0) {
        cache.setRootPosts(data.posts, data.nextCursor);
      }

      return data;
    },
    initialPageParam: undefined,
  });
}

// prefetch single post by ID
export async function prefetchPost(queryClient: QueryClient, postId: string) {
  const cache = usePostCache.getState();

  //check data in cache
  if (cache.hasPost(postId)) {
    return cache.getPost(postId);
  }

  // fetch from server
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/posts/${postId}`);
    if (!res.ok) return null;

    const post = await res.json();

    // add to cache
    cache.setPost(post);

    return post;
  } catch {
    return null;
  }
}

// prefetch parent chain for a post
export async function prefetchParentChain(postId: string) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/posts/${postId}/parents`);
    if (!res.ok) return [];

    const data = await res.json();
    return data.parents || [];
  } catch {
    return [];
  }
}

// check existing data in cache
export function hasDataInCache(queryClient: QueryClient, parentId?: string): boolean {
  const cache = usePostCache.getState();

  if (parentId) {
    // look for child
    const hasInZustand = cache.getChildren(parentId).length > 0;
    if (hasInZustand) return true;

    const data = queryClient.getQueryData<{ pages: PostsResponse[] }>(["posts", parentId]);
    return !!data?.pages?.[0]?.posts?.length;
  } else {
    // look for root
    const hasInZustand = cache.getRootPosts().length > 0;
    if (hasInZustand) return true;

    const data = queryClient.getQueryData<{ pages: PostsResponse[] }>(["posts", null]);
    return !!data?.pages?.[0]?.posts?.length;
  }
}
