import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUserEditForm } from "@/components/AdminUserEditForm";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/chat");
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscribed: true,
    },
  });

  if (!user) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to admin
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">
        {user.name ?? user.email}
      </h1>
      <AdminUserEditForm user={user} />
    </div>
  );
}
