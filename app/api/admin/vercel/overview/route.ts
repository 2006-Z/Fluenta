import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/adminAuth";
import { listDeployments, listEnvVars, listDomains } from "@/lib/vercel";

// Bundles the three Vercel reads the deployments admin page needs into one
// round trip instead of three separate client fetches (each of which used
// to also re-check auth independently).
export async function GET(request: Request) {
  if (!(await requireAdminToken(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [deploymentsResult, envResult, domainsResult] = await Promise.allSettled([
    listDeployments(),
    listEnvVars(),
    listDomains(),
  ]);

  if (
    deploymentsResult.status === "rejected" &&
    deploymentsResult.reason instanceof Error &&
    deploymentsResult.reason.message.includes("VERCEL_TOKEN")
  ) {
    return NextResponse.json({ error: deploymentsResult.reason.message }, { status: 502 });
  }

  return NextResponse.json({
    deployments: deploymentsResult.status === "fulfilled" ? deploymentsResult.value : [],
    envs:
      envResult.status === "fulfilled"
        ? envResult.value.map((e) => ({
            id: e.id,
            key: e.key,
            type: e.type,
            target: e.target,
            hasVisibleValue: typeof e.value === "string",
          }))
        : [],
    domains: domainsResult.status === "fulfilled" ? domainsResult.value : [],
  });
}
