type Props = {
  slug: string;
  businessName: string;
  fullName: string;
  bio: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  socials: (string | null | undefined)[];
  languages: string[];
  serviceAreas: { city: string; state: string }[];
  ratingAvg: number | null;
  ratingCount: number;
  baseUrl: string;
};

export function AgentJsonLd(props: Props) {
  const url = `${props.baseUrl}/agents/${props.slug}`;
  const sameAs = props.socials.filter((s): s is string => Boolean(s));

  const realEstateAgent: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": url,
    name: props.businessName,
    url,
    image: props.avatarUrl ?? undefined,
    description: props.tagline ?? props.bio?.slice(0, 300) ?? undefined,
    telephone: props.whatsappNumber ?? undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsLanguage:
      props.languages.length > 0 ? props.languages : undefined,
    areaServed:
      props.serviceAreas.length > 0
        ? props.serviceAreas.map((a) => ({
            "@type": "City",
            name: a.city,
            containedInPlace: { "@type": "AdministrativeArea", name: a.state },
          }))
        : undefined,
    employee: {
      "@type": "Person",
      name: props.fullName,
    },
  };
  if (props.ratingAvg && props.ratingCount > 0) {
    realEstateAgent.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: props.ratingAvg,
      ratingCount: props.ratingCount,
      bestRating: 5,
    };
  }

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: props.baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Agents",
        item: `${props.baseUrl}/agents`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: props.businessName,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgent) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
