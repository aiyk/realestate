import Link from "next/link";
import {
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  HeartHandshake,
} from "lucide-react";
import { NigeriaMark } from "@/components/illustrations/nigeria-mark";
import { NigeriaMap } from "@/components/illustrations/nigeria-map";
import { Trustmarks } from "@/components/illustrations/trustmarks";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-surface-2 to-surface-2/60">
      <div className="mx-auto max-w-[100rem] px-6 pt-16 pb-10">
        {/* Top: brand + cities map + newsletter */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold">
              <NigeriaMark />
              Realestate
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground text-pretty">
              We help Nigerian buyers find homes they actually want to live in —
              with verified agents, secure deposits, and zero hand-waving.
              Built with care in Yaba, used across the country.
            </p>

            <div className="mt-6 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Get monthly market notes
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Two minutes of market context, every first Monday. No fluff.
              </p>
              <NewsletterForm />
            </div>

            <div className="mt-6 flex gap-3 text-muted-foreground">
              <SocialIcon href="https://twitter.com" label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="mailto:hello@realestate.ng" label="Email">
                <Mail className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          {/* Live cities map */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Where we&apos;re live
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Four cities active, more on the way. Tap a dot to start browsing.
            </p>
            <div className="mt-3">
              <NigeriaMap className="text-primary" showLabels />
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol
            title="Explore"
            links={[
              { href: "/listings", label: "All listings" },
              { href: "/listings?propertyType=APARTMENT", label: "Apartments" },
              { href: "/listings?propertyType=HOUSE", label: "Houses" },
              { href: "/listings?propertyType=DUPLEX", label: "Duplexes" },
              { href: "/listings?propertyType=LAND", label: "Land" },
              { href: "/agents", label: "Find an agent" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { href: "/about", label: "About us" },
              { href: "/how-it-works", label: "How it works" },
              { href: "/agent/apply", label: "Become an agent" },
              { href: "/contact", label: "Press & partnerships" },
            ]}
          />
          <FooterCol
            title="Help"
            links={[
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Talk to a human" },
              { href: "/how-it-works#for-buyers", label: "Buyer guide" },
              { href: "/how-it-works#for-agents", label: "Agent guide" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { href: "/legal/terms", label: "Terms of use" },
              { href: "/legal/privacy", label: "Privacy & BVN" },
              { href: "/legal/escrow", label: "Escrow policy" },
              { href: "/legal/refunds", label: "Refund policy" },
            ]}
          />
        </div>

        {/* Trustmarks */}
        <div className="mt-14 flex flex-col gap-3 rounded-3xl border border-border bg-card px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Powered by people you already trust
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Deposits, identity, mail, and storage all run through battle-tested partners.
            </p>
          </div>
          <Trustmarks />
        </div>

        {/* Foot */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Realestate. Built with{" "}
            <HeartHandshake className="inline h-3 w-3 text-accent" /> in
            Yaba.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary hover:bg-primary-soft"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Got a question? We reply within the hour.
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
