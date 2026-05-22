import Link from "next/link";
import {
  ShieldCheck,
  Wallet,
  MessageCircle,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
} from "lucide-react";
import { DepositShield } from "@/components/illustrations/deposit-shield";
import { ChatBubbles } from "@/components/illustrations/chat-bubbles";
import { LagosSkyline } from "@/components/illustrations/skylines";
import { NigeriaMark } from "@/components/illustrations/nigeria-mark";
import { SpeechBubble } from "@/components/ui/speech-bubble";

type Variant = "login" | "signup" | "forgot" | "verify" | "reset";

const VARIANTS: Record<
  Variant,
  {
    eyebrow: string;
    title: string;
    blurb: string;
    illustration: "skyline" | "shield" | "chat";
    concierge: string;
  }
> = {
  login: {
    eyebrow: "Welcome back",
    title: "Pick up where you left off.",
    blurb:
      "Saved searches, your reservations, agent conversations — they're all waiting.",
    illustration: "skyline",
    concierge:
      "Hi 👋 — glad you're back. Sign in and we'll drop you exactly where you left off.",
  },
  signup: {
    eyebrow: "Welcome",
    title: "Let's get you home.",
    blurb:
      "Browsing is free. Sign up only when you're ready to reserve a property or message an agent.",
    illustration: "shield",
    concierge:
      "Takes about 30 seconds. You can browse the marketplace without an account — this just unlocks reserving and messaging.",
  },
  forgot: {
    eyebrow: "No worries",
    title: "Forgot it? It happens.",
    blurb:
      "Pop in the email you used. We'll send a reset link that lasts an hour.",
    illustration: "shield",
    concierge:
      "Heads up: the reset link expires in 60 minutes. Check spam if you don't see it in two minutes.",
  },
  verify: {
    eyebrow: "Almost there",
    title: "One click in your inbox.",
    blurb:
      "We sent you a verification link. It lasts 24 hours — open it once and you're set.",
    illustration: "chat",
    concierge:
      "If the email doesn't show, check spam or ping us at hello@realestate.ng — we'll re-issue you a fresh one.",
  },
  reset: {
    eyebrow: "Reset password",
    title: "Pick a new one — make it weird.",
    blurb:
      "Eight characters or more. We hash and salt before storing, but a long passphrase is still your best friend.",
    illustration: "shield",
    concierge:
      "Tip: a memorable sentence beats clever symbols. 'My-Lekki-balcony-2026!' is fine.",
  },
};

const FEATURES = [
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Verified Nigerian properties",
    body: "Real listings, real agents, real photos. Every listing is current.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Your identity, your secret",
    body: "BVN is hashed, never stored in plaintext. We just check it once.",
  },
  {
    icon: <Wallet className="h-4 w-4" />,
    title: "Deposits held safely",
    body: "Paystack collects, we hold. Money moves on signal, not on hope.",
  },
  {
    icon: <MessageCircle className="h-4 w-4" />,
    title: "Direct messaging with agents",
    body: "Audit-logged threads — no 'send your number and I'll WhatsApp you'.",
  },
];

export function AuthShell({
  variant,
  children,
  showFeatures = false,
}: {
  variant: Variant;
  children: React.ReactNode;
  showFeatures?: boolean;
}) {
  const v = VARIANTS[variant];

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-stretch px-6 py-10 lg:py-16">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_460px] lg:items-center">
        {/* Left panel — illustration + copy */}
        <div className="relative hidden lg:block">
          <Link
            href="/"
            className="absolute -top-4 left-0 inline-flex items-center gap-2 text-sm font-bold"
          >
            <NigeriaMark className="h-8 w-8" />
            Realestate
          </Link>

          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {v.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance">
            {v.title}
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground text-pretty">{v.blurb}</p>

          <div className="mt-8">
            {v.illustration === "shield" && (
              <DepositShield className="mx-auto h-64 w-64" />
            )}
            {v.illustration === "chat" && (
              <ChatBubbles className="mx-auto max-w-md" />
            )}
            {v.illustration === "skyline" && (
              <div className="overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
                <LagosSkyline className="text-primary/40" />
                <div className="mt-4">
                  <SpeechBubble
                    from="concierge"
                    avatar="·"
                    author="Concierge"
                    role="Realestate"
                  >
                    {v.concierge}
                  </SpeechBubble>
                </div>
              </div>
            )}
          </div>

          {showFeatures && (
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FEATURES.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground text-pretty">
                      {b.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right panel — the actual form */}
        <div className="mx-auto w-full max-w-md">
          {/* Mobile-only header */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold lg:hidden"
          >
            <NigeriaMark className="h-8 w-8" />
            Realestate
          </Link>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            {children}
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Protected by{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Lock className="h-3 w-3" /> Auth.js
            </span>{" "}
            ·{" "}
            <Link href="/contact" className="underline hover:text-primary">
              Need help?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/** Small icon set re-exported so individual auth pages can show a top-of-form chip. */
export const AuthIcons = { Lock, Mail, KeyRound, ShieldCheck };
