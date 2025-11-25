import PostCard from "@/components/post-card";
import Link from "next/link";
import React from "react";

export default function PostById() {
  return (
    <div className='max-w-5xl mx-auto space-y-4 py-10'>
      {Array.from({ length: 10 }).map((_, i) => (
        <Link href={`${1}`} key={i}>
          <PostCard username={`User ${i + 1}`} post={`Post ${i + 1}`} />
        </Link>
      ))}
    </div>
  );
}
