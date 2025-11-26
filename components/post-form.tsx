"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

interface PostFormProps {
  authorId: string;
  parentId?: string;
  mode?: "post" | "reply";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PostForm({ authorId, parentId, mode = "post", onSuccess, onCancel }: PostFormProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  const isReply = mode === "reply" || !!parentId;

  const createPostMutation = useMutation({
    mutationFn: async (data: { value: number; operation?: string; authorId: string; parentId?: string }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create post");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ["post", parentId] });
      }
      formRef.current?.reset();
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const value = formData.get("value") as string;
    const operation = formData.get("operation") as string;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      alert("Please enter a valid number");
      return;
    }

    if (isReply && !operation) {
      alert("Operation is required for replies");
      return;
    }

    createPostMutation.mutate({
      value: numValue,
      operation: operation || undefined,
      authorId,
      parentId,
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className='bg-white rounded border-gray-200 p-4 border drop-shadow space-y-4'>
      <h2 className='text-xl font-bold'>{isReply ? "Add Reply" : "Create New Post"}</h2>

      <div>
        <label htmlFor='value' className='block text-sm font-medium text-gray-700 mb-1 '>
          Value (number) <span className='text-red-500'>*</span>
        </label>
        <input
          type='number'
          step='any'
          id='value'
          name='value'
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Enter a number'
          required
          disabled={createPostMutation.isPending}
        />
      </div>

      {isReply && (
        <div>
          <label htmlFor='operation' className='block text-sm font-medium text-gray-700 mb-1'>
            Operation <span className='text-red-500'>*</span>
          </label>
          <select required name='operation' id='operation' className='cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' disabled={createPostMutation.isPending}>
            <option value='+'>Add</option>
            <option value='-'>Substract</option>
            <option value='/'>Divide</option>
            <option value='*'>Multiple</option>
          </select>
        </div>
      )}

      {createPostMutation.isError && <div className='text-red-500 text-sm'>{createPostMutation.error instanceof Error ? createPostMutation.error.message : "An error occurred"}</div>}

      <div className='flex gap-2'>
        <button type='submit' disabled={createPostMutation.isPending} className='cursor-pointer flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
          {createPostMutation.isPending ? (isReply ? "Replying..." : "Creating...") : isReply ? "Add Reply" : "Create Post"}
        </button>

        {onCancel && (
          <button type='button' onClick={onCancel} disabled={createPostMutation.isPending} className='cursor-pointer px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50'>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
