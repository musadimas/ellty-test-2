"use client";

interface NewDataButtonProps {
  onClick: () => void;
}

export default function NewDataButton({ onClick }: NewDataButtonProps) {
  return (
    <div className='fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce'>
      <button
        onClick={onClick}
        className='bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2'
      >
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
          />
        </svg>
        New Data Available
      </button>
    </div>
  );
}
