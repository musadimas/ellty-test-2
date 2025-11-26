"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PostCard from "@/components/post-card";
import PostForm from "@/components/post-form";
import NewDataButton from "@/components/new-data-button";
import clsx from "clsx";
import usePosts, { Post, PostsResponse } from "@/hooks/use-posts";
import { notFound } from "next/navigation";
import { usePostCache } from "@/store/post-cache";

export function PostList({ id, initialPost, parentChain = [] }: { id?: string; initialPost?: Post; parentChain?: Post[] }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const postCache = usePostCache();
  const [showNewDataButton, setShowNewDataButton] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<Date>(new Date());

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = usePosts(id);

  // add initialPost and parentChain to cache
  useEffect(() => {
    if (initialPost) {
      postCache.setPost(initialPost);
    }
    if (parentChain.length > 0) {
      parentChain.forEach((parent) => postCache.setPost(parent));
    }
  }, [initialPost, parentChain]);

  useEffect(() => {
    if (data?.pages && data.pages.length > 0) {
      const allPosts = data.pages.flatMap((page) => page.posts);
      if (allPosts.length > 0) {
        const latestPostDate = new Date(allPosts[0].createdAt);
        if (latestPostDate > lastFetchTimeRef.current) {
          lastFetchTimeRef.current = latestPostDate;
        }
      }
    }
  }, [data]);

  // check for new data every 3 minutes
  useEffect(() => {
    const checkForNewData = async () => {
      try {
        const endpoint = initialPost ? `/api/posts/${initialPost.id}/children?limit=1` : "/api/posts?limit=1";
        const res = await fetch(endpoint);
        if (!res.ok) return;

        const newData: PostsResponse = await res.json();
        if (newData.posts.length > 0) {
          const latestPost = newData.posts[0];
          const latestPostDate = new Date(latestPost.createdAt);

          // check for newer post than our last fetch
          if (latestPostDate > lastFetchTimeRef.current) {
            setShowNewDataButton(true);
            // stop the interval when new data is detected
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("Error checking for new data:", error);
      }
    };

    // polling every 3 minutes
    pollingIntervalRef.current = setInterval(checkForNewData, 180000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [initialPost]);

  const handleNewDataClick = () => {
    lastFetchTimeRef.current = new Date();
    setShowNewDataButton(false);
    queryClient.invalidateQueries({ queryKey: ["posts"] });

    // Restart the polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const endpoint = initialPost ? `/api/posts/${initialPost.id}/children?limit=1` : "/api/posts?limit=1";
        const res = await fetch(endpoint);
        if (!res.ok) return;

        const newData: PostsResponse = await res.json();
        if (newData.posts.length > 0) {
          const latestPost = newData.posts[0];
          const latestPostDate = new Date(latestPost.createdAt);

          if (latestPostDate > lastFetchTimeRef.current) {
            setShowNewDataButton(true);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("Error checking for new data:", error);
      }
    }, 180000);
  };

  // get posts from query or normalized cache as fallback
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  // merge with cache if needed
  const cachedPosts = id ? postCache.getChildren(id) : postCache.getRootPosts();
  const mergedPosts = allPosts.length > 0 ? allPosts : cachedPosts;

  if (isLoading) {
    // try to show cached data while loading
    const cachedData = id ? postCache.getChildren(id) : postCache.getRootPosts();

    if (cachedData.length > 0) {
      // show cached data immediately
      return (
        <div className='max-w-5xl mx-auto space-y-4 pb-10'>
          {showNewDataButton && <NewDataButton onClick={handleNewDataClick} />}

          <h1 className='text-center font-bold text-4xl pb-10 pt-20'>Posts Tree</h1>

          {session && (
            <div className='mb-6'>
              {!showPostForm ? (
                <button onClick={() => setShowPostForm(true)} className={clsx("cursor-pointer w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium", { hidden: cachedData.length === 0 || !!id })}>
                  Create New Post
                </button>
              ) : (
                <PostForm authorId={session.user?.id || ""} onSuccess={() => setShowPostForm(false)} onCancel={() => setShowPostForm(false)} />
              )}
            </div>
          )}

          {parentChain.map((parent: Post, index: number) => (
            <PostCard
              key={parent.id}
              id={parent.id}
              username={parent.author.name || parent.author.email || "Unknown"}
              post={parent.result}
              repliesCount={parent._count.children}
              replyTo={index > 0 ? parentChain[index - 1].author.email || parentChain[index - 1].author.name || parentChain[index - 1].author.id : null}
            />
          ))}
          {initialPost && (
            <PostCard
              key={initialPost.id}
              id={initialPost.id}
              username={initialPost.author.name || initialPost.author.email || "Unknown"}
              post={initialPost.result}
              repliesCount={initialPost._count.children}
              replyTo={parentChain.length > 0 ? parentChain[parentChain.length - 1].author.email || parentChain[parentChain.length - 1].author.name || parentChain[parentChain.length - 1].author.id : null}
            />
          )}
          {cachedData.map((post: Post) => (
            <PostCard
              key={post.id}
              id={post.id}
              username={post.author.name || post.author.email || "Unknown"}
              post={post.result}
              repliesCount={post._count.children}
              replyTo={initialPost ? initialPost.author.email || initialPost.author.name || initialPost.author.id : null}
            />
          ))}
        </div>
      );
    }

    return (
      <div className='max-w-5xl mx-auto space-y-4 pb-10'>
        <h1 className='text-center font-bold text-4xl pb-10 pt-20'>Posts Tree</h1>
        <div className='text-center text-gray-600'>Loading posts...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='max-w-5xl mx-auto space-y-4 pb-10'>
        <h1 className='text-center font-bold text-4xl pb-10 pt-20'>Posts Tree</h1>
        <div className='text-center text-red-600'>Error: {error instanceof Error ? error.message : "Failed to load posts"}</div>
      </div>
    );
  }

  if (id && !initialPost) return notFound();

  return (
    <div className='max-w-5xl mx-auto space-y-4 pb-10'>
      {showNewDataButton && <NewDataButton onClick={handleNewDataClick} />}

      <h1 className='text-center font-bold text-4xl pb-10 pt-20'>Posts Tree</h1>

      {session && (
        <div className='mb-6'>
          {!showPostForm ? (
            <button onClick={() => setShowPostForm(true)} className={clsx("cursor-pointer w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium", { hidden: mergedPosts.length === 0 || !!id })}>
              Create New Post
            </button>
          ) : (
            <PostForm authorId={session.user?.id || ""} onSuccess={() => setShowPostForm(false)} onCancel={() => setShowPostForm(false)} />
          )}
        </div>
      )}

      {mergedPosts.length === 0 && !initialPost ? (
        <div className='text-center py-20'>
          <p className='text-gray-600 mb-4'>No posts yet</p>
          {session ? (
            <button onClick={() => setShowPostForm(true)} className={clsx("cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium", { hidden: showPostForm || !!id })}>
              Create the First Post
            </button>
          ) : (
            <p className='text-gray-500'>Login to create the first post</p>
          )}
        </div>
      ) : (
        <>
          {parentChain.map((parent: Post, index: number) => (
            <PostCard
              key={parent.id}
              id={parent.id}
              username={parent.author.name || parent.author.email || "Unknown"}
              post={parent.result}
              repliesCount={parent._count.children}
              replyTo={index > 0 ? parentChain[index - 1].author.email || parentChain[index - 1].author.name || parentChain[index - 1].author.id : null}
            />
          ))}
          {initialPost && (
            <PostCard
              key={initialPost.id}
              id={initialPost.id}
              username={initialPost.author.name || initialPost.author.email || "Unknown"}
              post={initialPost.result}
              repliesCount={initialPost._count.children}
              replyTo={parentChain.length > 0 ? parentChain[parentChain.length - 1].author.email || parentChain[parentChain.length - 1].author.name || parentChain[parentChain.length - 1].author.id : null}
            />
          )}
          {mergedPosts.map((post: Post) => (
            <PostCard
              key={post.id}
              replyTo={initialPost ? initialPost.author.email || initialPost.author.name || initialPost.author.id : null}
              id={post.id}
              username={post.author.name || post.author.email || "Unknown"}
              post={post.result}
              repliesCount={post._count.children}
            />
          ))}

          {hasNextPage && (
            <div className='text-center pt-4'>
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className='bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
