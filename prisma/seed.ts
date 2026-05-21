import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@realestate.test";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const fullName = process.env.SEED_ADMIN_NAME ?? "Platform Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await hash(password, 12);
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "ADMIN",
      emailVerified: new Date(),
      kycStatus: "VERIFIED",
      kycVerifiedAt: new Date(),
    },
  });

  console.log(`Created admin: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
