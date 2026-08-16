import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const [username, password, role = "user", email] = process.argv.slice(2);

  if (!username || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <username> <password> [role] [email]");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role, ...(email ? { email } : {}) },
    create: { username, passwordHash, role, email },
  });

  console.log(`User "${user.username}" saved with role "${user.role}".`);
  await prisma.$disconnect();
}

main();
