import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Search,
  Users,
  Newspaper,
  Clock,
} from "lucide-react";
import { ContactForm } from "./contact-form";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { Callout } from "@/components/ui/callout";
import { LagosSkyline } from "@/components/illustrations/skylines";

export const metadata = {
  title: "Contact — Realestate",
  description:
    "Talk to us — buyers, agents, press. Real humans, replies within the hour.",
};

const LANES = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "I'm buying",
    blurb:
      "Wishlist, viewing requests, due diligence questions, deposit help.",
    quote: "Find me a 3-bed in Lekki under ₦80m by April.",
    cta: { href: "/listings", label: "Or just browse listings" },
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "I'm an agent",
    blurb: "Apply to list, payout questions, commission ledger, escalations.",
    quote: "How fast are payouts? Can I onboard my whole agency?",
    cta: { href: "/agent/apply", label: "Apply to list" },
  },
  {
    icon: <Newspaper className="h-5 w-5" />,
    title: "Press / partnerships",
    blurb: "Interviews, partnerships, integrations, anything that isn't 1-1.",
    quote: "We'd love to feature you in our weekend property section.",
    cta: { href: "mailto:press@realestate.ng", label: "press@realestate.ng" },
  },
];

export default function ContactPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-100 bg-gradient-to-b from-stone-50 via-amber-50/30 to-white py-16">
        <LagosSkyline className="absolute inset-x-0 bottom-0 h-20 w-full text-emerald-700/15" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Talk to us
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance">
            We&apos;d love to hear from you.
          </h1>
          <p className="mt-3 text-stone-600 text-pretty">
            Tell us what you&apos;re looking for, what&apos;s broken, or just
            say hi. A real human (not a bot) replies inside the hour during
            business hours.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            <Clock className="h-3.5 w-3.5" />
            Avg. response: 42 minutes
          </div>
        </div>
      </section>

      {/* Lanes */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Pick your lane
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance">
              So we can get you the right pair of eyes.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LANES.map((l, i) => (
              <div
                key={l.title}
                className={`rounded-2xl border border-stone-200 bg-white p-6 hover-lift animate-fade-up stagger-${i + 1}`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  {l.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{l.title}</h3>
                <p className="mt-2 text-sm text-stone-600 text-pretty">
                  {l.blurb}
                </p>
                <div className="mt-4">
                  <SpeechBubble from="them" avatar="?" tail>
                    {l.quote}
                  </SpeechBubble>
                </div>
                <Link
                  href={l.cta.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
                >
                  {l.cta.label} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="border-t border-stone-100 bg-stone-50/60 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Send us a note</h2>
                <p className="text-sm text-stone-500">
                  We read every message. Yes, every one.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-4">
            <ContactCard
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value="hello@realestate.ng"
              link="mailto:hello@realestate.ng"
              sub="Replies inside the hour, mornings to evenings."
            />
            <ContactCard
              icon={<Phone className="h-4 w-4" />}
              label="WhatsApp"
              value="+234 800 000 0000"
              link="https://wa.me/2348000000000"
              sub="For active reservations and viewings."
            />
            <ContactCard
              icon={<MapPin className="h-4 w-4" />}
              label="Lagos office"
              value="Ikoyi, Lagos · weekdays 9–6"
              sub="Drop in if we're expecting you."
            />
            <Callout tone="tip" title="For agents">
              Want to list properties? Skip this form — the agent application
              has everything we need.
              <Link
                href="/agent/apply"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
              >
                Become an agent → <Sparkles className="h-3 w-3" />
              </Link>
            </Callout>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ContactCard({
  icon,
  label,
  value,
  sub,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  link?: string;
}) {
  const Inner = (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-300">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            {label}
          </p>
          <p className="text-sm font-medium text-stone-900">{value}</p>
        </div>
      </div>
      {sub && (
        <p className="mt-3 text-xs text-stone-500 text-pretty">{sub}</p>
      )}
    </div>
  );
  return link ? <a href={link}>{Inner}</a> : Inner;
}
