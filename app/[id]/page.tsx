import { PostList } from "@/components/post-lists";
import { Post } from "@/hooks/use-posts";
import { notFound } from "next/navigation";

async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`/api/post/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export default async function PostByID({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) return notFound();
  return <PostList id={id} initialPost={post} />;
}
