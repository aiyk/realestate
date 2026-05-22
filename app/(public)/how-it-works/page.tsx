import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
  Eye,
  Receipt,
  Server,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlowDiagram } from "@/components/illustrations/flow-diagram";
import { DepositShield } from "@/components/illustrations/deposit-shield";
import { ChatBubbles } from "@/components/illustrations/chat-bubbles";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { Callout } from "@/components/ui/callout";
import { StoryStep } from "@/components/ui/story-step";
import { DepositCalculator } from "@/components/landing/deposit-calculator";
import { NUDGES } from "@/lib/voice";

export const metadata = {
  title: "How it works — Realestate",
  description:
    "Two flows, one trust layer: verified buyers, verified agents, deposits held in escrow, audit-logged messaging.",
};

const BUYER_STEPS = [
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Browse openly",
    body: "Every listing is public. Filter by city, type, price, bedrooms. No sign-up to look — you only register the moment you want to reserve or message an agent.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Verify yourself once",
    body: "BVN check via Dojah before reserving. We hash and never store your BVN in plaintext. Takes thirty seconds, lasts forever.",
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "Reserve with a deposit",
    body: "Pay a listing-specific deposit via Paystack. The property goes 'reserved' — quiet for every other buyer — until the deal closes.",
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "Talk to the agent",
    body: "Built-in messaging keeps everything in one place — searchable, time-stamped, exportable if it ever matters.",
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "Close offline",
    body: "Meet the agent, do paperwork, complete the sale. We handle the trust layer. You handle the keys.",
  },
];

const AGENT_STEPS = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Apply in 3 steps",
    body: "Business details, identity verification (BVN/NIN), then a real bank account that matches your KYC name. Five minutes if you have your docs ready.",
  },
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Get approved",
    body: "Admin reviews and creates a Paystack transfer recipient on approval. From that moment, your dashboard unlocks.",
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "List & moderate",
    body: "Create listings with photos, price, deposit amount. Submit for review — admin publishes once it's clean.",
  },
  {
    icon: <Banknote className="h-5 w-5" />,
    title: "Get paid",
    body: "Commission is computed automatically on conversion and paid out via Paystack within days. Ledger entries are exportable.",
  },
];

const BEHIND = [
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Audit log",
    body: "Every CUD on listings, reservations, agents, payouts, KYC writes a tamper-evident row. We can answer 'when did that happen?' to the second.",
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "Idempotent webhooks",
    body: "Paystack callbacks for charge.success and transfer.success are idempotent — replays don't double-charge or double-pay.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "BVN privacy",
    body: NUDGES.bvnPrivacy,
  },
  {
    icon: <Server className="h-5 w-5" />,
    title: "Always-on simulators",
    body: "Dev mode runs simulators for Paystack, Dojah, R2, and Resend so we can rehearse every flow before pushing.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      {/* Anchor nav (sticky) */}
      <nav className="sticky top-16 z-20 hidden border-b border-border bg-card/85 backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Jump to
          </span>
          <a href="#overview" className="text-muted-foreground hover:text-primary">
            Overview
          </a>
          <a href="#for-buyers" className="text-muted-foreground hover:text-primary">
            For buyers
          </a>
          <a
            href="#deposit"
            className="text-muted-foreground hover:text-primary"
          >
            The deposit
          </a>
          <a href="#for-agents" className="text-muted-foreground hover:text-primary">
            For agents
          </a>
          <a
            href="#behind-the-scenes"
            className="text-muted-foreground hover:text-primary"
          >
            Behind the scenes
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="overview"
        className="relative overflow-hidden border-b border-border py-20"
      >
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            The longer version
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl text-balance">
            How Realestate works
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            Two flows: one for buyers, one for agents. Both share the same
            non-negotiables — verified identity, escrowed deposits,
            audit-logged messaging.
          </p>
        </div>

        <div className="mx-auto mt-12 hidden max-w-5xl px-6 lg:block">
          <FlowDiagram />
        </div>
      </section>

      {/* Buyer flow */}
      <section id="for-buyers" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                For buyers
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                Find, verify, reserve, close
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-pretty">
                You stay anonymous until you&apos;re ready to reserve. We never
                ask for your phone number until an agent is ready to meet you.
              </p>
            </div>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
              Create a buyer account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {BUYER_STEPS.map((s, i) => (
              <StoryStep
                key={s.title}
                index={i + 1}
                title={s.title}
                body={s.body}
                illustration={s.icon}
              />
            ))}
          </ol>

          <div className="mt-12">
            <ChatBubbles className="mx-auto max-w-xl" />
          </div>
        </div>
      </section>

      {/* Deposit deep-dive */}
      <section
        id="deposit"
        className="border-y border-border bg-gradient-to-b from-surface-2/60 via-white to-surface-2/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                The deposit, explained
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Small money down, big peace of mind.
              </h2>
              <p className="mt-3 text-muted-foreground text-pretty">
                A deposit is what tells the universe you mean business. It puts
                the listing on quiet, locks in the price, and gives the agent
                permission to share the exact location.
              </p>
              <div className="mt-6 space-y-3">
                <Callout tone="tip" title="It&apos;s held, not spent">
                  Paystack collects the deposit. We hold it. The money only
                  moves when both sides agree — or it&apos;s refunded.
                </Callout>
                <Callout tone="success" title="Refundable inside 48 hours">
                  If the agent goes silent or you change your mind in the first
                  48 hours, your deposit comes back automatically.
                </Callout>
                <Callout tone="info" title="Counted against the sale price">
                  When you close, the deposit comes off the final balance.
                  You&apos;re not paying twice.
                </Callout>
              </div>
            </div>
            <div>
              <DepositCalculator />
              <div className="mx-auto mt-6 grid max-w-sm place-items-center">
                <DepositShield className="h-48 w-48" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent flow */}
      <section id="for-agents" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                For agents
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                Apply, get verified, list, get paid
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-pretty">
                We don&apos;t ask for fees up front. You earn — you get paid.
                Same week, same currency, same bank account.
              </p>
            </div>
            <Link
              href="/agent/apply"
              className={cn(buttonVariants({ variant: "accent", size: "sm" }))}
            >
              Apply now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {AGENT_STEPS.map((s, i) => (
              <StoryStep
                key={s.title}
                index={i + 1}
                title={s.title}
                body={s.body}
                illustration={s.icon}
                accent="amber"
              />
            ))}
          </div>

          <div className="mt-12 space-y-3">
            <SpeechBubble from="them" avatar="T" author="Tunde" role="Agent">
              How long until I see my first payout after a sale closes?
            </SpeechBubble>
            <SpeechBubble
              from="concierge"
              avatar="·"
              author="Concierge"
              role="Realestate"
            >
              Usually under 48 hours. Admin reviews payouts in a batch most
              afternoons, Paystack moves it overnight. The ledger entry shows
              you exactly when the transfer initiated.
            </SpeechBubble>
          </div>
        </div>
      </section>

      {/* Behind the scenes */}
      <section
        id="behind-the-scenes"
        className="border-y border-border bg-surface-2/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Behind the scenes
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              The boring engineering that makes the easy parts easy.
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              We tell you this because you&apos;d ask. Trust isn&apos;t a
              slogan, it&apos;s a stack.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {BEHIND.map((b, i) => (
              <div
                key={b.title}
                className={cn(
                  "rounded-2xl border border-border bg-card p-6 hover-lift animate-fade-up",
                  `stagger-${i + 1}`,
                )}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  {b.icon}
                </div>
                <h3 className="mt-3 text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            Still wondering if this is for you?
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            We&apos;d rather have a conversation than push you to sign up.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Send us a note
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/listings"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Or just start browsing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
