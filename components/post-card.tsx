"use client";

import React, { useState } from "react";
import { ReplyIcon, UserIcon } from "./icons";
import clsx from "clsx";
import PostForm from "./post-form";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchChildren } from "@/lib/prefetch";
import { useRouter } from "next/navigation";

export default function PostCard({
  id,
  username,
  post,
  replyTo,
  repliesCount = 0,
  isHighlighted = false,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  id: string;
  username: string;
  post: number;
  replyTo?: string | null;
  repliesCount?: number;
  isHighlighted?: boolean;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);

  const handleOnboardReply = () => setShowReplyBox((prev) => !prev);

  const handlePrefetch = () => {
    prefetchChildren(queryClient, id);
  };

  return (
    <>
      <div {...props} className={clsx("border drop-shadow p-4 border-gray-200", isHighlighted ? "bg-blue-500/10" : "bg-white", props.className)}>
        <Link href={id} aria-disabled={isHighlighted} className={clsx("flex gap-4", "cursor-default")} onMouseEnter={handlePrefetch}>
          <div className='rounded bg-gray-200 size-20 grid place-content-center '>
            <UserIcon className='text-gray-500' />
          </div>
          <div className='flex flex-col justify-between gap-4'>
            <div className='space-y-4'>
              <div className='space-y-1'>
                <p className='font-bold'>{username}</p>
                {replyTo && <p className='text-xs text-gray-500'>reply to {replyTo}</p>}
              </div>
              <p className='text-sm'>{post}</p>
              {repliesCount > 0 && (
                <p className='text-xs text-gray-500'>
                  {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
                </p>
              )}
            </div>
          </div>
        </Link>
        {session && (
          <div className='flex justify-end w-fit ml-auto'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOnboardReply();
              }}
              className='group hover:text-black text-gray-400 cursor-pointer p-2 flex gap-2 items-center transition-colors ease-in-out'
            >
              <ReplyIcon className='group-hover:text-black text-gray-400 transition-colors ease-in-out' width={20} height={20} viewBox='0 0 24 24' /> Reply
            </button>
          </div>
        )}
      </div>

      {showReplyBox && session && (
        <PostForm
          parentId={id}
          authorId={session.user?.id || ""}
          mode='reply'
          onSuccess={() => {
            setShowReplyBox(false);
            router.push(id);
          }}
          onCancel={() => setShowReplyBox(false)}
        />
      )}
    </>
  );
}
