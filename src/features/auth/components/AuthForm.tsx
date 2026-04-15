"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store";
import { isDemoMode } from "@/shared/lib/supabase";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success: boolean;
    if (isLogin) {
      success = await signIn(email, password);
    } else {
      success = await signUp(email, password, name);
    }

    if (success) {
      // Small delay to ensure auth state is hydrated before navigation
      await new Promise((r) => setTimeout(r, 100));
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold text-brand-teal-800">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {isLogin
          ? "Sign in to access your projects."
          : "Start designing your modular home for free."}
      </p>

      {/* Demo mode notice */}
      {isDemoMode && (
        <div className="mb-4 rounded-lg bg-brand-amber-50 border border-brand-amber-200 px-3 py-2 text-xs text-brand-amber-700">
          Demo mode — accounts are stored locally in your browser.
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={signInWithGoogle}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-600">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              placeholder="Your name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-600">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder={isLogin ? "Your password" : "Min. 6 characters"}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
          />
        </div>

        {isLogin && (
          <div className="text-right">
            <Link href="/reset-password" className="text-xs text-gray-400 hover:text-brand-teal-600 transition-colors">
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-amber-600 disabled:opacity-60"
        >
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      {/* Switch link */}
      <p className="mt-5 text-center text-xs text-gray-500">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand-teal-800 hover:underline">
              Sign up free
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-teal-800 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>

      {/* Demo shortcut */}
      <div className="mt-4 text-center">
        <Link
          href="/project/demo/land"
          className="text-xs text-gray-400 hover:text-brand-teal-600 transition-colors"
        >
          Skip — try the demo without an account
        </Link>
      </div>
    </div>
  );
}
