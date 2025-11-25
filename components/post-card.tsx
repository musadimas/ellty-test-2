"use client";

import React, { useState } from "react";
import { ReplyIcon, UserIcon } from "./icons";
import clsx from "clsx";
import PostForm from "./post-form";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PostCard({
  id,
  username,
  post,
  replyTo,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  id: string;
  username: string;
  post: string;
  replyTo?: string;
}) {
  const { data: session } = useSession();

  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);

  const handleOnboardReply = () => setShowReplyBox((prev) => !prev);

  return (
    <>
      <div {...props} className={clsx("bg-white border drop-shadow p-4 border-gray-200", props.className)}>
        <Link href={id} className='flex gap-4'>
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

      {showReplyBox && session && <PostForm authorId={session.user?.id || ""} mode='reply' onSuccess={() => setShowReplyBox(false)} onCancel={() => setShowReplyBox(false)} />}
    </>
  );
}
