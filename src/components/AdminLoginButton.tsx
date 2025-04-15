"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AdminLoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Admin Login with Google
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Logout ({session.user?.email})
    </button>
  );
}
