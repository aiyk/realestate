"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

const listingIdSchema = z.object({ listingId: z.string().cuid() });

export async function toggleFavorite(
  raw: unknown,
): Promise<{ favorited: boolean }> {
  const { listingId } = listingIdSchema.parse(raw);
  const user = await requireAuth();
  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });
  if (existing) {
    await prisma.favorite.delete({
      where: { userId_listingId: { userId: user.id, listingId } },
    });
    revalidatePath("/account/favorites");
    return { favorited: false };
  }
  await prisma.favorite.create({
    data: { userId: user.id, listingId },
  });
  revalidatePath("/account/favorites");
  return { favorited: true };
}

export async function isFavorited(listingId: string): Promise<boolean> {
  const user = await requireAuth();
  const f = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });
  return !!f;
}
