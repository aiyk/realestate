"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, MessageSquare, ReceiptText, ShieldCheck, User as UserIcon } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

export function HeaderUserMenu({
  email,
  fullName,
  role,
}: {
  email: string;
  fullName: string;
  role: UserRole;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-3 text-sm transition-colors hover:bg-stone-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[11px] font-semibold text-white">
          {initials || "U"}
        </span>
        <span className="hidden text-sm font-medium text-stone-700 sm:inline">
          {fullName.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-stone-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right animate-scale-in rounded-2xl border border-stone-200 bg-white p-2 shadow-lg">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-stone-900">{fullName}</p>
            <p className="truncate text-xs text-stone-500">{email}</p>
          </div>
          <div className="mt-1 h-px bg-stone-200/70" />
          <MenuItem href="/account" icon={<UserIcon className="h-4 w-4" />} label="Account" />
          <MenuItem
            href="/account/reservations"
            icon={<ReceiptText className="h-4 w-4" />}
            label="My reservations"
          />
          <MenuItem
            href="/account/messages"
            icon={<MessageSquare className="h-4 w-4" />}
            label="Messages"
          />
          {role === "ADMIN" && (
            <MenuItem
              href="/admin/dashboard"
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Admin console"
            />
          )}
          {role === "AGENT" && (
            <MenuItem
              href="/agent/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Agent dashboard"
            />
          )}
          {role === "BUYER" && (
            <MenuItem
              href="/agent/apply"
              icon={<Sparkle />}
              label="Become an agent"
              accent
            />
          )}
          <div className="mt-1 h-px bg-stone-200/70" />
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-stone-100",
        accent ? "text-amber-700" : "text-stone-700",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function Sparkle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z" />
    </svg>
  );
}
