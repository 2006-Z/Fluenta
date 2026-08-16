import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, MessagesSquare, Layers, Crown, Database, Cloud } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/chat");
  }

  const [userCount, conversationCount, messageCount, users] = await Promise.all([
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        role: true,
        subscribed: true,
        preferredLanguage: true,
        createdAt: true,
        conversations: {
          orderBy: { updatedAt: "desc" },
          select: {
            company: true,
            role: true,
            _count: { select: { messages: true } },
          },
        },
      },
    }),
  ]);

  const companyCounts: Record<string, number> = {};
  for (const user of users) {
    for (const conversation of user.conversations) {
      if (conversation.company) {
        companyCounts[conversation.company] =
          (companyCounts[conversation.company] ?? 0) + 1;
      }
    }
  }
  const companyBreakdown = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
  const topCompany = companyBreakdown[0];
  const maxCompanyCount = companyBreakdown[0]?.[1] ?? 1;

  const stats = [
    { label: "Total Users", value: userCount, icon: Users },
    { label: "Total Conversations", value: conversationCount, icon: Layers },
    { label: "Total Messages", value: messageCount, icon: MessagesSquare },
    { label: "Top Company", value: topCompany?.[0] ?? "—", icon: Crown },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
          <p className="mt-1 text-muted">Usage overview across all users.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/database"
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            <Database size={15} />
            Database
          </Link>
          <Link
            href="/admin/deployments"
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            <Cloud size={15} />
            Deployments
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <stat.icon size={18} />
            </div>
            <p className="text-xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {companyBreakdown.length > 0 && (
        <div className="mb-8 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Companies being prepped for
          </h2>
          <div className="flex flex-col gap-3">
            {companyBreakdown.map(([company, count]) => (
              <div key={company} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm text-muted">
                  {company}
                </span>
                <div className="h-2 flex-1 rounded-full bg-background">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-hover"
                    style={{ width: `${(count / maxCompanyCount) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm text-foreground">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <h2 className="border-b border-border px-5 py-4 text-sm font-semibold text-foreground">
          Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-5 py-2 font-medium">Name</th>
                <th className="px-5 py-2 font-medium">Sessions</th>
                <th className="px-5 py-2 font-medium">Role</th>
                <th className="px-5 py-2 font-medium">Subscribed</th>
                <th className="px-5 py-2 font-medium">Feedback language</th>
                <th className="px-5 py-2 font-medium">Joined</th>
                <th className="px-5 py-2 font-medium">Messages</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userMessages = user.conversations.reduce(
                  (sum, c) => sum + c._count.messages,
                  0
                );
                return (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-foreground hover:text-accent"
                      >
                        {user.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {user.conversations.length}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          user.role === "admin"
                            ? "rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400"
                            : "rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400"
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          user.subscribed
                            ? "rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success"
                            : "rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted"
                        }
                      >
                        {user.subscribed ? "Subscribed" : "Free"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {user.preferredLanguage}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-muted">{userMessages}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
