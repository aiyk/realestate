import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileEditor } from "@/components/agent/profile/profile-editor";
import { VerificationBanner } from "@/components/agent/profile/verification-banner";

export const dynamic = "force-dynamic";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AgentProfilePage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/profile");
  if (u.role !== "AGENT") redirect("/agent");

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: u.id },
    include: {
      specialties: true,
      serviceAreas: { orderBy: [{ isPrimary: "desc" }, { state: "asc" }] },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-stone-600">
          Finish your application first to unlock the profile editor.
        </p>
        <Link
          href="/agent/apply"
          className={cn(buttonVariants({ variant: "default" }), "mt-5")}
        >
          Continue application
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            How buyers see you
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Your public profile
          </h1>
          <p className="mt-1 max-w-xl text-sm text-stone-600">
            Everything on this page is what buyers see at{" "}
            <span className="font-mono text-stone-800">/agents/{profile.slug}</span>.
            Save as you go — each tab is independent.
          </p>
        </div>
        {profile.status === "APPROVED" && (
          <Link
            href={`/agents/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            View public profile <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="mt-6">
        <VerificationBanner
          status={profile.status}
          kycStatus={u.kycStatus}
          hasBankAccount={Boolean(
            profile.bankCode && profile.bankAccountNo && profile.bankAccountName,
          )}
          rejectionReason={profile.rejectionReason}
        />
      </div>

      <div className="mt-8">
        <ProfileEditor
          initial={{
            businessName: profile.businessName,
            bio: profile.bio ?? "",
            tagline: profile.tagline ?? "",
            cacNumber: profile.cacNumber ?? "",
            yearsOfExperience: profile.yearsOfExperience?.toString() ?? "",
            whatsappNumber: profile.whatsappNumber ?? "",
            avatarUrl: profile.avatarUrl ?? "",
            coverPhotoUrl: profile.coverPhotoUrl ?? "",
            twitterUrl: profile.twitterUrl ?? "",
            linkedinUrl: profile.linkedinUrl ?? "",
            instagramUrl: profile.instagramUrl ?? "",
            facebookUrl: profile.facebookUrl ?? "",
            websiteUrl: profile.websiteUrl ?? "",
            languages: profile.languages,
            credentials: profile.credentials,
            specialties: profile.specialties.map((s) => s.propertyType),
            serviceAreas: profile.serviceAreas.map((a) => ({
              city: a.city,
              state: a.state,
              radiusKm: a.radiusKm ?? undefined,
              isPrimary: a.isPrimary,
            })),
            faqs: profile.faqs.map((f) => ({
              question: f.question,
              answer: f.answer,
              isPublished: f.isPublished,
            })),
            initials: initialsOf(profile.businessName),
          }}
        />
      </div>
    </section>
  );
}
