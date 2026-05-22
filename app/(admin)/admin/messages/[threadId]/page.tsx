import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { ThreadView } from "@/components/messaging/thread-view";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ threadId: string }> };

export default async function AdminThreadPage({ params }: Props) {
  const { threadId } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      listing: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      buyer: { select: { fullName: true, email: true } },
    },
  });
  if (!thread) notFound();

  return (
    <section>
      <Link href="/admin/messages" className="text-sm text-muted-foreground hover:underline">
        ← All conversations
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{thread.listing.title}</h1>
      <p className="text-sm text-muted-foreground">
        Buyer: {thread.buyer.fullName} ({thread.buyer.email})
      </p>
      <div className="mt-6">
        <ThreadView
          threadId={thread.id}
          currentUserId={user.id}
          initialMessages={thread.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </section>
  );
}
