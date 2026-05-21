import { ThreadInbox } from "@/components/messaging/thread-inbox";

export default function AgentMessagesPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Conversations with buyers about your listings.
      </p>
      <div className="mt-6">
        <ThreadInbox basePath="/agent/messages" />
      </div>
    </section>
  );
}
