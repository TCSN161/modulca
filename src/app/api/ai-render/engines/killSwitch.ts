/**
 * Engine kill switches (env-driven, no deploy of code needed — just a Vercel
 * env change + redeploy).
 *
 *   AI_ENGINES_DISABLED=cloudflare-klein,ai-horde   → comma list of engine ids
 *   ENGINE_CLOUDFLARE_KLEIN_DISABLED=1               → per engine (id upper-cased,
 *                                                      non-alphanumerics → "_")
 *
 * Accepted truthy values: 1, true, yes, on (case-insensitive).
 */
const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function engineEnvName(engineId: string): string {
  return `ENGINE_${engineId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_DISABLED`;
}

export function isEngineDisabled(
  engineId: string,
  env: Record<string, string | undefined> = process.env
): boolean {
  const list = (env.AI_ENGINES_DISABLED || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.includes(engineId.toLowerCase())) return true;
  const v = (env[engineEnvName(engineId)] || "").trim().toLowerCase();
  return TRUTHY.has(v);
}
