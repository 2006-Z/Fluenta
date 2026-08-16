import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

async function main() {
  const [username, password, role = "user"] = process.argv.slice(2);

  if (!username || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <username> <password> [role]");
    process.exit(1);
  }

  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role },
    create: { username, passwordHash, role },
  });

  console.log(`User "${user.username}" saved with role "${user.role}".`);
  await prisma.$disconnect();
}

main();
