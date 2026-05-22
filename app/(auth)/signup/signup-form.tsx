"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { PasswordStrength } from "@/components/auth/password-strength";

export function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasError(false);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      fullName: String(fd.get("fullName") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
    };
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setHasError(true);
      toast.error(data?.error?.message ?? "Sign-up failed", {
        description:
          "Check that your email is valid and your password is at least 8 characters.",
      });
      return;
    }
    setOk(true);
    toast.success("Account created", {
      description: "Check your email to verify.",
    });
    setTimeout(() => router.push("/login?signup=1"), 1500);
  }

  if (ok) {
    return (
      <div className="rounded-md bg-primary-soft p-4 text-sm text-primary-soft-foreground">
        Account created. Check your email to verify, then sign in.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required minLength={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          state={hasError ? "error" : "default"}
          aria-invalid={hasError || undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" placeholder="08012345678" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          state={hasError ? "error" : "default"}
          aria-invalid={hasError || undefined}
        />
        <PasswordStrength value={password} className="mt-1" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
