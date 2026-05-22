import { ThreadInbox } from "@/components/messaging/thread-inbox";

export default function AdminMessagesPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">All conversations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Read-only oversight of every thread on the platform.
      </p>
      <div className="mt-6">
        <ThreadInbox basePath="/admin/messages" />
      </div>
    </section>
  );
}
