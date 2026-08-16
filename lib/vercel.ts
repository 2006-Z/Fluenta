const VERCEL_API = "https://api.vercel.com";
const PROJECT = "fluenta";

async function vercelFetch(path: string, init?: RequestInit) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error(
      "VERCEL_TOKEN is not configured — add it in Environment Variables to enable this."
    );
  }
  const res = await fetch(`${VERCEL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Vercel API error (${res.status})`);
  }
  return data;
}

export async function listDeployments(limit = 20) {
  const data = await vercelFetch(`/v6/deployments?projectId=${PROJECT}&limit=${limit}`);
  return data.deployments as Array<{
    uid: string;
    name: string;
    url: string;
    created: number;
    state: string;
    target: string | null;
    meta?: { githubCommitMessage?: string; githubCommitSha?: string };
  }>;
}

export async function redeployDeployment(deploymentId: string) {
  return vercelFetch(`/v13/deployments`, {
    method: "POST",
    body: JSON.stringify({
      name: PROJECT,
      deploymentId,
      target: "production",
    }),
  });
}

export async function listEnvVars() {
  const data = await vercelFetch(`/v10/projects/${PROJECT}/env`);
  return data.envs as Array<{
    id: string;
    key: string;
    value?: string;
    type: string;
    target: string[];
  }>;
}

export async function createEnvVar(key: string, value: string, target: string[]) {
  return vercelFetch(`/v10/projects/${PROJECT}/env`, {
    method: "POST",
    body: JSON.stringify({ key, value, type: "encrypted", target }),
  });
}

export async function updateEnvVar(envId: string, value: string) {
  return vercelFetch(`/v9/projects/${PROJECT}/env/${envId}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

export async function deleteEnvVar(envId: string) {
  return vercelFetch(`/v9/projects/${PROJECT}/env/${envId}`, {
    method: "DELETE",
  });
}

export async function listDomains() {
  const data = await vercelFetch(`/v9/projects/${PROJECT}/domains`);
  return data.domains as Array<{
    name: string;
    verified: boolean;
    createdAt?: number;
  }>;
}
