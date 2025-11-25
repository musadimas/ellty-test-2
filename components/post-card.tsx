"use client";

import React, { useState } from "react";
import { ReplyIcon, UserIcon } from "./icons";
import clsx from "clsx";
import Form from "./form";

export default function PostCard({
  username,
  post,
  replyTo,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  username: string;
  post: string;
  replyTo?: string;
}) {
  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);

  const handleOnboardReply = () => setShowReplyBox((prev) => !prev);

  return (
    <>
      <div {...props} className={clsx("bg-white border drop-shadow p-4 border-gray-200 flex gap-4 relative", props.className)}>
        <div className='rounded bg-gray-200 size-20 grid place-content-center'>
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
          <div>
            <button onClick={handleOnboardReply} className='group hover:text-black text-gray-400 cursor-pointer p-2 flex gap-2 items-center transition-colors ease-in-out'>
              <ReplyIcon className='group-hover:text-black text-gray-400 transition-colors ease-in-out' width={20} height={20} viewBox='0 0 24 24' /> Reply
            </button>
          </div>
        </div>
      </div>
      {showReplyBox && <Form />}
    </>
  );
}
