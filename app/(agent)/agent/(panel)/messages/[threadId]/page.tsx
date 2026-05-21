import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { ThreadView } from "@/components/messaging/thread-view";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ threadId: string }> };

export default async function AgentThreadPage({ params }: Props) {
  const { threadId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      listing: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      participants: { select: { userId: true } },
      buyer: { select: { fullName: true, email: true } },
    },
  });
  if (!thread) notFound();
  if (!thread.participants.find((p) => p.userId === user.id) && user.role !== "ADMIN") {
    redirect("/agent/messages");
  }

  await prisma.threadParticipant.updateMany({
    where: { threadId, userId: user.id },
    data: { lastReadAt: new Date() },
  });

  return (
    <section>
      <Link
        href="/agent/messages"
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Inbox
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{thread.listing.title}</h1>
      <p className="text-sm text-neutral-500">
        With buyer {thread.buyer.fullName} ({thread.buyer.email})
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
