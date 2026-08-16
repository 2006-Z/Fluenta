import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const [email, password, role = "user", name] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <email> <password> [role] [name]");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash, role, ...(name ? { name } : {}) },
    create: {
      email: normalizedEmail,
      passwordHash,
      role,
      name: name ?? normalizedEmail.split("@")[0],
      emailVerified: true,
    },
  });

  console.log(`User "${user.email}" saved with role "${user.role}".`);
  await prisma.$disconnect();
}

main();
