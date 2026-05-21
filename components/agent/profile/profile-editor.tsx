"use client";
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AvatarUploader } from "@/components/agent/profile/avatar-uploader";
import { FaqEditor } from "@/components/agent/profile/faq-editor";

const TABS = [
  "Basics",
  "Specialties",
  "Languages",
  "Service areas",
  "Socials",
  "Credentials",
  "FAQ",
] as const;
type Tab = (typeof TABS)[number];

const PROPERTY_TYPES = [
  "HOUSE",
  "APARTMENT",
  "LAND",
  "DUPLEX",
  "BUNGALOW",
  "TERRACE",
] as const;
type PropertyType = (typeof PROPERTY_TYPES)[number];

type ServiceArea = {
  city: string;
  state: string;
  radiusKm?: number;
  isPrimary?: boolean;
};
type FaqItem = { question: string; answer: string; isPublished: boolean };

type Initial = {
  businessName: string;
  bio: string;
  tagline: string;
  cacNumber: string;
  yearsOfExperience: string;
  whatsappNumber: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  languages: string[];
  credentials: string[];
  specialties: PropertyType[];
  serviceAreas: ServiceArea[];
  faqs: FaqItem[];
  initials: string;
};

function SavedBadge({ at }: { at: number | null }) {
  if (!at) return null;
  return <span className="text-xs text-emerald-700">Saved.</span>;
}

function ChipList({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              className="rounded-full p-0.5 hover:bg-emerald-200"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={commit}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

export function ProfileEditor({ initial }: { initial: Initial }) {
  const [tab, setTab] = useState<Tab>("Basics");

  // Basics
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [bio, setBio] = useState(initial.bio);
  const [cacNumber, setCacNumber] = useState(initial.cacNumber);
  const [yoe, setYoe] = useState(initial.yearsOfExperience);
  const [whatsapp, setWhatsapp] = useState(initial.whatsappNumber);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(initial.coverPhotoUrl);

  // Socials
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);

  // Languages / credentials / specialties / service areas
  const [languages, setLanguages] = useState<string[]>(initial.languages);
  const [credentials, setCredentials] = useState<string[]>(initial.credentials);
  const [specialties, setSpecialties] = useState<PropertyType[]>(
    initial.specialties,
  );
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(
    initial.serviceAreas,
  );
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  // Per-section saving state
  const [savedAt, setSavedAt] = useState<Partial<Record<Tab, number>>>({});
  const [busy, setBusy] = useState<Partial<Record<Tab, boolean>>>({});
  const [err, setErr] = useState<Partial<Record<Tab, string>>>({});

  function setStatus(t: Tab, patch: { saved?: number; busy?: boolean; err?: string | null }) {
    if (patch.saved !== undefined)
      setSavedAt((s) => ({ ...s, [t]: patch.saved! }));
    if (patch.busy !== undefined) setBusy((s) => ({ ...s, [t]: patch.busy! }));
    if (patch.err !== undefined)
      setErr((s) => ({ ...s, [t]: patch.err ?? undefined }));
  }

  async function patchProfile(t: Tab, body: Record<string, unknown>) {
    setStatus(t, { busy: true, err: null });
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Save failed");
      }
      setStatus(t, { saved: Date.now() });
    } catch (e) {
      setStatus(t, { err: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setStatus(t, { busy: false });
    }
  }

  async function putReplace(t: Tab, path: string, body: Record<string, unknown>) {
    setStatus(t, { busy: true, err: null });
    try {
      const res = await fetch(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Save failed");
      }
      setStatus(t, { saved: Date.now() });
    } catch (e) {
      setStatus(t, { err: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setStatus(t, { busy: false });
    }
  }

  async function saveBasics() {
    await patchProfile("Basics", {
      businessName,
      tagline,
      bio,
      cacNumber,
      yearsOfExperience: yoe ? Number(yoe) : undefined,
      whatsappNumber: whatsapp,
    });
  }
  async function saveSocials() {
    await patchProfile("Socials", {
      twitterUrl,
      linkedinUrl,
      instagramUrl,
      facebookUrl,
      websiteUrl,
    });
  }
  async function saveLanguages() {
    await putReplace("Languages", "/api/agent/profile/languages", { languages });
  }
  async function saveCredentials() {
    await putReplace("Credentials", "/api/agent/profile/credentials", {
      credentials,
    });
  }
  async function saveSpecialties() {
    await putReplace("Specialties", "/api/agent/profile/specialties", {
      specialties,
    });
  }
  async function saveServiceAreas() {
    await putReplace("Service areas", "/api/agent/profile/service-areas", {
      serviceAreas,
    });
  }

  function addServiceArea() {
    const city = newCity.trim();
    const state = newState.trim();
    if (!city || !state) return;
    if (
      serviceAreas.some(
        (a) =>
          a.city.toLowerCase() === city.toLowerCase() &&
          a.state.toLowerCase() === state.toLowerCase(),
      )
    ) {
      setNewCity("");
      setNewState("");
      return;
    }
    setServiceAreas([
      ...serviceAreas,
      { city, state, isPrimary: serviceAreas.length === 0 },
    ]);
    setNewCity("");
    setNewState("");
  }

  return (
    <div>
      <nav className="flex flex-wrap gap-1 border-b border-stone-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              tab === t
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800",
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="mt-6 max-w-2xl">
        {tab === "Basics" && (
          <div className="space-y-6">
            <AvatarUploader
              variant="cover"
              initialUrl={coverPhotoUrl || null}
              onUploaded={async (url) => {
                setCoverPhotoUrl(url);
                await patchProfile("Basics", { coverPhotoUrl: url || undefined });
              }}
            />
            <AvatarUploader
              variant="avatar"
              initialUrl={avatarUrl || null}
              initials={initial.initials}
              onUploaded={async (url) => {
                setAvatarUrl(url);
                await patchProfile("Basics", { avatarUrl: url || undefined });
              }}
            />
            <div>
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                placeholder="One line buyers see on your card — e.g. Luxury homes in Lekki Phase 1"
                onChange={(e) => setTagline(e.target.value)}
                maxLength={160}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="What sets you apart? Areas you know, deals you've closed, your approach."
                className="flex w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm shadow-sm focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cac">CAC number (optional)</Label>
                <Input
                  id="cac"
                  value={cacNumber}
                  onChange={(e) => setCacNumber(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div>
                <Label htmlFor="yoe">Years of experience</Label>
                <Input
                  id="yoe"
                  type="number"
                  min={0}
                  max={80}
                  value={yoe}
                  onChange={(e) => setYoe(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                placeholder="+2348012345678"
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <p className="mt-1 text-xs text-stone-500">
                Buyers can tap WhatsApp on your public profile if this is set.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="button" onClick={saveBasics} disabled={busy.Basics}>
                {busy.Basics && <Loader2 className="h-4 w-4 animate-spin" />}
                Save basics
              </Button>
              <SavedBadge at={savedAt.Basics ?? null} />
              {err.Basics && (
                <span className="text-xs text-red-600">{err.Basics}</span>
              )}
            </div>
          </div>
        )}

        {tab === "Specialties" && (
          <div className="space-y-5">
            <p className="text-sm text-stone-600">
              Which property types do you specialise in? Buyers filter the
              directory by these.
            </p>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt) => {
                const on = specialties.includes(pt);
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() =>
                      setSpecialties(
                        on
                          ? specialties.filter((x) => x !== pt)
                          : [...specialties, pt],
                      )
                    }
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium ring-1 transition",
                      on
                        ? "bg-emerald-700 text-white ring-emerald-700"
                        : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
                    )}
                  >
                    {pt}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={saveSpecialties}
                disabled={busy.Specialties}
              >
                {busy.Specialties && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save specialties
              </Button>
              <SavedBadge at={savedAt.Specialties ?? null} />
              {err.Specialties && (
                <span className="text-xs text-red-600">{err.Specialties}</span>
              )}
            </div>
          </div>
        )}

        {tab === "Languages" && (
          <div className="space-y-5">
            <p className="text-sm text-stone-600">
              List languages you can negotiate in. Suggestions: English, Yoruba,
              Igbo, Hausa, Pidgin.
            </p>
            <ChipList
              values={languages}
              onChange={setLanguages}
              placeholder="Type a language and hit Enter"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={saveLanguages}
                disabled={busy.Languages}
              >
                {busy.Languages && <Loader2 className="h-4 w-4 animate-spin" />}
                Save languages
              </Button>
              <SavedBadge at={savedAt.Languages ?? null} />
              {err.Languages && (
                <span className="text-xs text-red-600">{err.Languages}</span>
              )}
            </div>
          </div>
        )}

        {tab === "Service areas" && (
          <div className="space-y-5">
            <p className="text-sm text-stone-600">
              Cities &amp; states you cover. The first one is your primary area.
            </p>
            <ul className="space-y-2">
              {serviceAreas.map((a, i) => (
                <li
                  key={`${a.city}-${a.state}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium text-stone-900">
                    {a.city}, {a.state}
                  </span>
                  {a.isPrimary && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      PRIMARY
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    {!a.isPrimary && (
                      <button
                        type="button"
                        onClick={() =>
                          setServiceAreas(
                            serviceAreas.map((x, idx) => ({
                              ...x,
                              isPrimary: idx === i,
                            })),
                          )
                        }
                        className="text-xs font-medium text-emerald-700 hover:underline"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setServiceAreas(
                          serviceAreas.filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder="City (e.g. Lekki)"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <Input
                placeholder="State (e.g. Lagos)"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addServiceArea}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={saveServiceAreas}
                disabled={busy["Service areas"]}
              >
                {busy["Service areas"] && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save service areas
              </Button>
              <SavedBadge at={savedAt["Service areas"] ?? null} />
              {err["Service areas"] && (
                <span className="text-xs text-red-600">
                  {err["Service areas"]}
                </span>
              )}
            </div>
          </div>
        )}

        {tab === "Socials" && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Buyers click these icons on your public profile. Leave any blank
              to hide.
            </p>
            {(
              [
                ["websiteUrl", "Website", websiteUrl, setWebsiteUrl],
                ["twitterUrl", "X / Twitter", twitterUrl, setTwitterUrl],
                ["linkedinUrl", "LinkedIn", linkedinUrl, setLinkedinUrl],
                ["instagramUrl", "Instagram", instagramUrl, setInstagramUrl],
                ["facebookUrl", "Facebook", facebookUrl, setFacebookUrl],
              ] as const
            ).map(([id, label, val, setter]) => (
              <div key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  value={val}
                  placeholder="https://…"
                  onChange={(e) => setter(e.target.value)}
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <Button type="button" onClick={saveSocials} disabled={busy.Socials}>
                {busy.Socials && <Loader2 className="h-4 w-4 animate-spin" />}
                Save socials
              </Button>
              <SavedBadge at={savedAt.Socials ?? null} />
              {err.Socials && (
                <span className="text-xs text-red-600">{err.Socials}</span>
              )}
            </div>
          </div>
        )}

        {tab === "Credentials" && (
          <div className="space-y-5">
            <p className="text-sm text-stone-600">
              Things like &quot;REDAN member&quot;, &quot;ESVARBON-registered surveyor&quot;,
              &quot;10+ years closed&quot;. Buyers trust signals like these.
            </p>
            <ChipList
              values={credentials}
              onChange={setCredentials}
              placeholder="Add a credential and hit Enter"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={saveCredentials}
                disabled={busy.Credentials}
              >
                {busy.Credentials && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save credentials
              </Button>
              <SavedBadge at={savedAt.Credentials ?? null} />
              {err.Credentials && (
                <span className="text-xs text-red-600">{err.Credentials}</span>
              )}
            </div>
          </div>
        )}

        {tab === "FAQ" && <FaqEditor initial={initial.faqs} />}
      </div>
    </div>
  );
}
