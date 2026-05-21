import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { emitUserEvent } from "@/lib/events";
import { sendMail } from "@/lib/mailer";
import { logger } from "@/lib/logger";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  emailHtml?: string;
};

const DEFAULT_PREFS: Record<NotificationType, { in_app: boolean; email: boolean }> = {
  LEAD_NEW: { in_app: true, email: true },
  LEAD_BOOKED: { in_app: true, email: true },
  RESERVATION_NEW: { in_app: true, email: true },
  RESERVATION_PAID: { in_app: true, email: true },
  LISTING_APPROVED: { in_app: true, email: true },
  LISTING_REJECTED: { in_app: true, email: true },
  PAYOUT_PROCESSING: { in_app: true, email: false },
  PAYOUT_PAID: { in_app: true, email: true },
  MESSAGE_NEW: { in_app: true, email: false },
  OPEN_HOUSE_REMINDER: { in_app: true, email: true },
  PROFILE_VERIFIED: { in_app: true, email: true },
  SYSTEM: { in_app: true, email: false },
};

type ChannelPrefs = { in_app: boolean; email: boolean };

function resolvePrefs(
  type: NotificationType,
  stored: unknown,
): ChannelPrefs {
  const fallback = DEFAULT_PREFS[type] ?? { in_app: true, email: false };
  if (!stored || typeof stored !== "object") return fallback;
  const map = stored as Record<string, Partial<ChannelPrefs> | undefined>;
  const entry = map[type];
  if (!entry) return fallback;
  return {
    in_app: entry.in_app ?? fallback.in_app,
    email: entry.email ?? fallback.email,
  };
}

export async function notify(input: NotifyInput): Promise<void> {
  const [user, pref] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true, fullName: true },
    }),
    prisma.agentNotificationPref.findUnique({
      where: { userId: input.userId },
      select: { prefs: true },
    }),
  ]);
  if (!user) {
    logger.warn("notify: user not found", { userId: input.userId });
    return;
  }
  const prefs = resolvePrefs(input.type, pref?.prefs);

  if (prefs.in_app) {
    const row = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        entityType: input.entityType,
        entityId: input.entityId,
        actionUrl: input.actionUrl,
      },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        actionUrl: true,
        createdAt: true,
      },
    });
    emitUserEvent(input.userId, {
      type: "notification",
      notification: {
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        actionUrl: row.actionUrl,
        createdAt: row.createdAt.toISOString(),
      },
    });
  }

  if (prefs.email && user.email) {
    const html =
      input.emailHtml ??
      `<p>${input.title}</p>${input.body ? `<p>${input.body}</p>` : ""}${
        input.actionUrl
          ? `<p><a href="${input.actionUrl}">Open in Realestate</a></p>`
          : ""
      }`;
    await sendMail({ to: user.email, subject: input.title, html });
  }
}
