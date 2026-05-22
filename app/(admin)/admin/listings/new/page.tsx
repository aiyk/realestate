import { ListingForm } from "@/components/listings/listing-form";

export default function NewListingPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">New listing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Drafts are private until you publish them.
      </p>
      <div className="mt-6">
        <ListingForm mode="create" redirectTo="/admin/listings/{id}/edit" />
      </div>
    </section>
  );
}
