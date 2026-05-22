"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function ForgotPasswordForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(fd.get("email") ?? "") }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Couldn't send the reset link", {
        description: "Try again in a moment.",
      });
      return;
    }
    toast.success("Reset link sent — check your email");
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-md bg-primary-soft p-4 text-sm text-primary-soft-foreground">
        If that email is registered, a reset link is on the way. The link
        expires in 1 hour.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
