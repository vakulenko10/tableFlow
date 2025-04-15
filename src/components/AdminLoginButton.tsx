"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

export function AdminLoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Admin Login with Google
      </Button>
    );
  }

  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      variant='destructive'
    >
      Logout ({session.user?.email})
    </Button>
  );
}
