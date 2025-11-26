"use client";

interface NewDataButtonProps {
  onClick: () => void;
}

export default function NewDataButton({ onClick }: NewDataButtonProps) {
  return (
    <div className='fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce'>
      <button onClick={onClick} className='bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2'>
        New Data Available
      </button>
    </div>
  );
}
