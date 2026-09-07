"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { authService } from "@/lib/auth";
import { apiService } from "@/lib/service";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["Participants", "Mentors", "Judges", "Organisers"] as const;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { token, user } = await apiService.login(username, password);
      authService.setToken(token);

      // Redirect based on role
      const roleRoutes = {
        TEAM: "/team",
        MENTOR: "/mentor",
        JUDGE: "/judge",
        ADMIN: "/admin",
        SUPER_ADMIN: "/super-admin",
      };

      router.push(roleRoutes[user.role]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background relative min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <div className="absolute top-4 right-4 z-20 sm:top-5 sm:right-5">
        <ThemeToggle />
      </div>

      {/* ---------------------------------------------------- brand panel --
          Stacks above the form on small screens and becomes the left half of
          a split layout from lg up. Same artwork either way. */}
      <aside className="border-hairline relative flex flex-col overflow-hidden border-b px-6 pt-11 pb-7 sm:px-10 lg:justify-between lg:border-r lg:border-b-0 lg:p-12 max-lg:[@media(max-height:700px)]:pt-8 max-lg:[@media(max-height:700px)]:pb-5">
        <div
          aria-hidden
          className="hatch pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden
          className="bg-hackx/10 pointer-events-none absolute -top-40 -left-24 size-[26rem] rotate-12 blur-[110px] lg:size-[34rem] lg:blur-[130px]"
        />

        <div className="relative hidden items-center gap-2.5 lg:flex">
          <span className="border-hackx bg-hackx flex size-8 items-center justify-center rounded-md border text-white">
            <XMark className="h-3.5" />
          </span>
          <span className="text-foreground text-[0.9375rem] font-semibold tracking-tight">
            MUJ HackX <span className="text-faint font-normal">4.0</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <XMark className="text-hackx/85 h-10 lg:h-20 max-lg:[@media(max-height:700px)]:h-8" />
          <h1 className="text-foreground mt-5 text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.035em] lg:mt-8 lg:text-[2.75rem] lg:leading-[1.05] max-lg:[@media(max-height:700px)]:mt-4 max-lg:[@media(max-height:700px)]:text-[1.5rem]">
            The control room
            <br />
            for MUJ HackX 4.0.
          </h1>
          <p className="text-muted-foreground mt-3 text-[0.8125rem] leading-relaxed lg:mt-4 lg:text-[0.9375rem]">
            Problem statements, mentorship queues, evaluation rounds and room
            assignments — one console, every role.
          </p>
        </div>

        <div className="relative mt-6 lg:mt-0 max-lg:[@media(max-height:700px)]:hidden">
          <p className="eyebrow hidden lg:block">Built for</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 lg:mt-3 lg:gap-x-5 lg:gap-y-2">
            {ROLES.map((r) => (
              <li
                key={r}
                className="text-faint lg:text-muted-foreground flex items-center gap-1.5 text-xs lg:gap-2 lg:text-[0.8125rem]"
              >
                <span className="bg-hackx/60 size-1 rotate-45" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* -------------------------------------------------------- form side */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:min-h-screen lg:py-14 max-lg:[@media(max-height:700px)]:py-7">
        <div className="mx-auto w-full max-w-[22rem]">
          <p className="eyebrow">MUJ HackX 4.0 dashboard</p>
          <h2 className="text-foreground mt-2.5 text-[1.75rem] leading-none font-semibold tracking-[-0.03em]">
            Sign in
          </h2>
          <p className="text-muted-foreground mt-2.5 text-[0.8125rem]">
            Use the credentials issued to your team or staff account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 lg:mt-9">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="HX4-000"
                className="h-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-faint border-hairline mt-8 border-t pt-5 text-xs lg:mt-9">
            MUJ HackX 4.0 · Manipal University Jaipur
          </p>
        </div>
      </main>
    </div>
  );
}
