import { Facebook, Globe, Instagram, Linkedin, Twitter } from "lucide-react";

type Props = {
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
};

function SocialLink({
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
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-600 ring-1 ring-stone-200 transition hover:bg-stone-50 hover:text-emerald-700"
    >
      {children}
    </a>
  );
}

export function AgentSocialRow({
  websiteUrl,
  twitterUrl,
  linkedinUrl,
  instagramUrl,
  facebookUrl,
}: Props) {
  const any =
    websiteUrl || twitterUrl || linkedinUrl || instagramUrl || facebookUrl;
  if (!any) return null;
  return (
    <div className="inline-flex flex-wrap gap-2">
      {websiteUrl && (
        <SocialLink href={websiteUrl} label="Website">
          <Globe className="h-4 w-4" />
        </SocialLink>
      )}
      {twitterUrl && (
        <SocialLink href={twitterUrl} label="X / Twitter">
          <Twitter className="h-4 w-4" />
        </SocialLink>
      )}
      {linkedinUrl && (
        <SocialLink href={linkedinUrl} label="LinkedIn">
          <Linkedin className="h-4 w-4" />
        </SocialLink>
      )}
      {instagramUrl && (
        <SocialLink href={instagramUrl} label="Instagram">
          <Instagram className="h-4 w-4" />
        </SocialLink>
      )}
      {facebookUrl && (
        <SocialLink href={facebookUrl} label="Facebook">
          <Facebook className="h-4 w-4" />
        </SocialLink>
      )}
    </div>
  );
}
