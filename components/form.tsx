import clsx from "clsx";
import React from "react";

export default function Form(props: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>) {
  return (
    <form {...props} className={clsx("bg-white border drop-shadow p-4 space-y-6 border-gray-200 gap-4 relative", props.className)}>
      <div className='flex justify-between items-center'>
        <h3 className='font-medium'>Send a Reply</h3>
        <select name='operation' id='operation' className='rounded border drop-shadow p-2 bg-white border-gray-300 text-sm'>
          <option value='+'>Add</option>
          <option value='-'>Substract</option>
          <option value='/'>Divide</option>
          <option value='*'>Multiple</option>
        </select>
      </div>
      <input type='number' className='w-full p-2' placeholder='Enter a number' />
      <hr />
      <div className='flex justify-end'>
        <button type='submit' className='p-2 min-w-32 text-sm bg-blue-500 text-white rounded items-end'>
          Send
        </button>
      </div>
    </form>
  );
}
