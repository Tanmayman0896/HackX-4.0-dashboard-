"use client";

import Link from "next/link";
import { authService } from "@/lib/auth";
import { useEffect } from "react";

function Logout() {
  const handleLogout = async () => {
    try {
      authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    handleLogout();
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="border-border bg-card shadow-e2 w-full max-w-sm rounded-xl border p-8 text-center">
        <h1 className="text-xl font-bold tracking-tight">
          You have been logged out
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Thank you for using our service!
        </p>
        <Link
          href="/"
          className="bg-hackx shadow-e1 hover:bg-hackx/90 mt-6 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-colors duration-150"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default Logout;
