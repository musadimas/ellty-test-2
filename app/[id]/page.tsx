import { PostList } from "@/components/post-lists";
import { notFound } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { prefetchPost, prefetchParentChain } from "@/lib/prefetch";

export default async function PostByID({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  const [post, parents] = await Promise.all([prefetchPost(queryClient, id), prefetchParentChain(id)]);

  if (!post) return notFound();

  return <PostList id={id} initialPost={post} parentChain={parents} />;
}
