import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";

type Props = { agentUserId: string };

type Action = {
  icon: React.ReactNode;
  label: string;
  body: string;
  href: string;
  tone: "primary" | "amber" | "stone";
};

const TONE_CLASS: Record<Action["tone"], string> = {
  primary: "bg-emerald-700 text-emerald-50 hover:bg-emerald-800",
  amber:
    "bg-amber-50 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100",
  stone:
    "bg-white text-stone-900 ring-1 ring-stone-200 hover:bg-stone-50",
};

export async function QuickActions({ agentUserId }: Props) {
  const [oldestUnreadThread, nextVisit, draftCount] = await Promise.all([
    prisma.messageThread.findFirst({
      where: {
        listing: { agentId: agentUserId },
        participants: { some: { userId: agentUserId } },
      },
      orderBy: { lastMessageAt: "asc" },
      select: {
        id: true,
        listing: { select: { title: true } },
        lastMessageAt: true,
        participants: {
          where: { userId: agentUserId },
          select: { lastReadAt: true },
        },
      },
    }),
    prisma.visitRequest.findFirst({
      where: {
        listing: { agentId: agentUserId },
        status: { in: ["REQUESTED", "CONFIRMED"] },
        slotStartsAt: { gte: new Date() },
      },
      orderBy: { slotStartsAt: "asc" },
      select: {
        id: true,
        status: true,
        slotStartsAt: true,
        listing: { select: { title: true } },
      },
    }),
    prisma.listing.count({
      where: { agentId: agentUserId, status: "DRAFT" },
    }),
  ]);

  const actions: Action[] = [];

  if (oldestUnreadThread) {
    const last = oldestUnreadThread.participants[0]?.lastReadAt;
    const isUnread = !last || last < oldestUnreadThread.lastMessageAt;
    if (isUnread) {
      actions.push({
        icon: <MessageCircle className="h-5 w-5" />,
        label: "Reply to oldest unread",
        body: oldestUnreadThread.listing.title,
        href: `/agent/messages/${oldestUnreadThread.id}`,
        tone: "amber",
      });
    }
  }

  if (nextVisit?.slotStartsAt) {
    const when = nextVisit.slotStartsAt.toLocaleString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    actions.push({
      icon: <CalendarCheck className="h-5 w-5" />,
      label:
        nextVisit.status === "REQUESTED"
          ? "Confirm next viewing"
          : "Next viewing",
      body: `${nextVisit.listing.title} · ${when}`,
      href: "/agent/calendar",
      tone: "stone",
    });
  }

  actions.push({
    icon: <Plus className="h-5 w-5" />,
    label: draftCount > 0 ? "Finish a draft listing" : "Add a listing",
    body:
      draftCount > 0
        ? `${draftCount} draft${draftCount === 1 ? "" : "s"} waiting`
        : "Get your next property in front of buyers",
    href: draftCount > 0 ? "/agent/listings" : "/agent/listings/new",
    tone: "primary",
  });

  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
        <Sparkles className="h-3 w-3" />
        Quick actions
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((a, i) => (
          <Link
            key={i}
            href={a.href}
            className={`group flex flex-col gap-2 rounded-2xl px-4 py-4 transition ${TONE_CLASS[a.tone]}`}
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                {a.icon}
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
            <div>
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="text-xs opacity-80">{a.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
