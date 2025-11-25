"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import LoginModal from "./login-modal";

export default function Account() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  console.log({ session });

  useEffect(() => {
    const handleClickOut = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOut);
    return () => document.removeEventListener("mousedown", handleClickOut);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsDropdownOpen(false);
  };

  if (session?.user) {
    return (
      <div className='relative z-10' ref={dropdownRef}>
        <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className='cursor-pointer flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors fixed top-0 right-0 m-5'>
          <Image src='/icons/user-icon.svg' alt='User' width={24} height={24} />
          {isDropdownOpen && (
            <div className='absolute top-2/3 right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 my-5'>
              <div className='px-4 py-2 border-b border-gray-200'>
                {session.user.name && <p className='text-sm font-medium text-gray-900'>{session.user.name}</p>}
                <p className='text-xs text-gray-500'>{session.user.email}</p>
              </div>
              <button onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors cursor-pointer'>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className='cursor-pointer bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 rounded-md transition-colors fixed top-0 right-0 m-2 z-10'>
        Login
      </button>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
