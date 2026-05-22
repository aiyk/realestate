import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { ThreadView } from "@/components/messaging/thread-view";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ threadId: string }> };

export default async function MessageThreadPage({ params }: Props) {
  const { threadId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      listing: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      participants: { select: { userId: true } },
    },
  });
  if (!thread) notFound();
  if (
    user.role !== "ADMIN" &&
    !thread.participants.find((p) => p.userId === user.id)
  ) {
    redirect("/account/messages");
  }

  // Mark thread as read for this user
  await prisma.threadParticipant.updateMany({
    where: { threadId, userId: user.id },
    data: { lastReadAt: new Date() },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <Link
        href="/account/messages"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Inbox
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{thread.listing.title}</h1>
      <Link
        href={`/listings/${thread.listing.slug}`}
        className="text-sm text-muted-foreground underline"
      >
        View listing
      </Link>
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
    </main>
  );
}
