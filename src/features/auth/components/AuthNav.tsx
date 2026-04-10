"use client";

import Link from "next/link";
import { useAuthStore } from "../store";

/**
 * Auth-aware nav buttons: shows "Log in" when logged out,
 * shows user avatar/name + Dashboard link when logged in.
 */
export function AuthNav() {
  const { isAuthenticated, userName, userAvatar, userEmail } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-brand-gray transition-colors hover:text-brand-charcoal"
        >
          Log in
        </Link>
        <Link
          href="/project/demo/choose"
          className="rounded-[12px] bg-brand-olive-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-olive-800"
        >
          Try Free Demo
        </Link>
      </div>
    );
  }

  const displayName = userName ?? userEmail?.split("@")[0] ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-brand-gray transition-colors hover:text-brand-charcoal"
      >
        Dashboard
      </Link>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-full bg-brand-olive-100 pl-3 pr-1.5 py-1 transition-colors hover:bg-brand-olive-200"
      >
        <span className="text-sm font-medium text-brand-olive-700">{displayName}</span>
        {userAvatar ? (
          <img src={userAvatar} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-olive-700 text-[10px] font-bold text-white">
            {initials}
          </span>
        )}
      </Link>
    </div>
  );
}
