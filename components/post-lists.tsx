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

export function PostList({ id, initialPost }: { id?: string; initialPost?: Post }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showNewDataButton, setShowNewDataButton] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<Date>(new Date());

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = usePosts(id);

  // Polling mechanism - check for new data every 3 minutes
  useEffect(() => {
    const checkForNewData = async () => {
      try {
        const res = await fetch("/api/posts?limit=1");
        if (!res.ok) return;

        const newData: PostsResponse = await res.json();
        if (newData.posts.length > 0) {
          const latestPost = newData.posts[0];
          const latestPostDate = new Date(latestPost.createdAt);

          // Check if there's a newer post than our last fetch
          if (latestPostDate > lastFetchTimeRef.current) {
            setShowNewDataButton(true);
            // Stop the interval when new data is detected
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

    // Start polling every 3 minutes (180000ms)
    pollingIntervalRef.current = setInterval(checkForNewData, 180000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
        const res = await fetch("/api/posts?limit=1");
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

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
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
            <button onClick={() => setShowPostForm(true)} className={clsx("cursor-pointer w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium", { hidden: allPosts.length === 0 || !!id })}>
              Create New Post
            </button>
          ) : (
            <PostForm authorId={session.user?.id || ""} onSuccess={() => setShowPostForm(false)} onCancel={() => setShowPostForm(false)} />
          )}
        </div>
      )}

      {allPosts.length === 0 ? (
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
          {initialPost && <PostCard key={initialPost.id} id={initialPost.id} username={initialPost.author.name || initialPost.author.email || "Unknown"} post={`${initialPost.operation || ""} ${initialPost.value}`} />}
          {allPosts.map((post) => (
            <PostCard key={post.id} id={post.id} username={post.author.name || post.author.email || "Unknown"} post={`${post.operation || ""} ${post.value}`} />
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
