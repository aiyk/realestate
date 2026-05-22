"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(!!initialError);

  // If the page was reached with ?error=… show the toast once on mount.
  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
    // toast identity is stable per render; we only want this on initial error.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialError]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasError(false);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setHasError(true);
      toast.error("Invalid email or password", {
        description: "Double-check your credentials and try again.",
      });
      return;
    }
    toast.success("Welcome back");
    router.push(next && next.startsWith("/") ? next : "/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          state={hasError ? "error" : "default"}
          aria-invalid={hasError || undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          state={hasError ? "error" : "default"}
          aria-invalid={hasError || undefined}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
