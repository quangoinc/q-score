"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-xs text-muted hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}
