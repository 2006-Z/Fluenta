import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { AdminDeploymentsView } from "@/components/AdminDeploymentsView";

export default async function AdminDeploymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/chat");
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to admin
      </Link>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Deployments</h1>
      <p className="mb-8 text-muted">
        Manage Vercel deployments, environment variables, and domains.
      </p>
      <AdminDeploymentsView />
    </div>
  );
}
