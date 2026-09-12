import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PCC Automation is a separate, stateful Playwright server — it can't run
  // as Vercel serverless functions, so it's hosted on its own (e.g. Render)
  // and reverse-proxied here so it still appears under fluenta.website/pcc.
  // Set PCC_AUTOMATION_ORIGIN (e.g. https://pcc-automation.onrender.com)
  // once that deployment exists; until then /pcc simply isn't rewritten.
  async rewrites() {
    const pccOrigin = process.env.PCC_AUTOMATION_ORIGIN;
    if (!pccOrigin) return [];
    return [
      { source: "/pcc", destination: `${pccOrigin}/` },
      { source: "/pcc/:path*", destination: `${pccOrigin}/:path*` },
    ];
  },
};

export default nextConfig;
