import { ListingForm } from "@/components/listings/listing-form";

export default function NewAgentListingPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">New listing</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Save as draft, then submit for review when ready.
      </p>
      <div className="mt-6">
        <ListingForm mode="create" redirectTo="/agent/listings/{id}/edit" />
      </div>
    </section>
  );
}
