"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import z from "zod";
import { signIn } from "next-auth/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().optional(),
});

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fieldsError, setFieldsError] = useState<Record<string, string | null> | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setFieldsError(null);
      setGlobalError(null);
      setIsRegisterMode(false);
    }
  }, [isOpen]);

  const validateFormData = useCallback((fd: FormData, isRegister: boolean) => {
    const rawData = {
      email: fd.get("email"),
      password: fd.get("password"),
      ...(isRegister && { name: fd.get("name") || undefined }),
    };

    const schema = isRegister ? registerSchema : loginSchema;
    const validationResult = schema.safeParse(rawData);

    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error) as any;
      const errors: Record<string, string | null> = {
        email: treeified.properties?.email?.errors?.[0] || null,
        password: treeified.properties?.password?.errors?.[0] || null,
      };

      if (isRegister) {
        errors.name = treeified.properties?.name?.errors?.[0] || null;
      }

      setFieldsError(errors);
      return null;
    }

    return rawData;
  }, []);

  const handleRegister = useCallback(
    async (fd: FormData) => {
      const rawData = validateFormData(fd, true);
      if (!rawData) {
        setGlobalError("Invalid Payload");
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawData),
      });

      const json = await res.json();

      if (!res.ok) throw json;

      return handleLogin(fd);
    },
    [validateFormData]
  );

  const handleLogin = useCallback(
    async (fd: FormData) => {
      const rawData = validateFormData(fd, false);
      if (!rawData) return;

      const res = await signIn("credentials", {
        email: rawData.email as string,
        password: rawData.password as string,
        redirect: false,
      });

      if (res?.error) {
        setGlobalError("Invalid email or password");
        return;
      }

      onClose();
      router.refresh();
    },
    [validateFormData, onClose, router]
  );

  const handleSubmit = useCallback(
    async (fd: FormData) => {
      setGlobalError(null);
      setFieldsError(null);
      setIsSubmitting(true);
      try {
        if (isRegisterMode) await handleRegister(fd);
        else await handleLogin(fd);
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isRegisterMode, handleRegister, handleLogin]
  );

  const toggleMode = useCallback(() => {
    setIsRegisterMode((prev) => !prev);
    setFieldsError(null);
    setGlobalError(null);
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6' onClick={(e) => e.stopPropagation()}>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold'>{isRegisterMode ? "Register" : "Login"}</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 text-2xl cursor-pointer'>
            &times;
          </button>
        </div>

        <form action={handleSubmit} className='space-y-4'>
          {isRegisterMode && (
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
                Name (optional)
              </label>
              <input disabled={isSubmitting} type='text' id='name' name='name' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Your name' />
              {fieldsError?.name && <p className='text-red-500 text-xs mt-1'>{fieldsError.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input disabled={isSubmitting} type='email' id='email' name='email' required className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='email@example.com' />
            {fieldsError?.email && <p className='text-red-500 text-xs mt-1'>{fieldsError.email}</p>}
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              disabled={isSubmitting}
              type='password'
              id='password'
              name='password'
              required
              minLength={6}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter your password'
            />
            {fieldsError?.password && <p className='text-red-500 text-xs mt-1'>{fieldsError.password}</p>}
          </div>

          {globalError && !fieldsError && <div className='text-red-500 text-sm'>{globalError}</div>}

          <button disabled={isSubmitting} type='submit' className='cursor-pointer w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
            {isSubmitting ? (isRegisterMode ? "Registering..." : "Logging in...") : isRegisterMode ? "Register" : "Login"}
          </button>

          <div className='text-center text-sm'>
            <button disabled={isSubmitting} type='button' onClick={toggleMode} className='text-blue-600 hover:text-blue-700 font-medium cursor-pointer disabled:opacity-50'>
              {isRegisterMode ? "Already have an account? Login" : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
