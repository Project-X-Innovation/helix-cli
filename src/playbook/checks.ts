import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { hasFlag } from "../lib/flags.js";

type CheckRecord = {
  id: string;
  status: string;
  complianceRate?: number | null;
  checkedAt?: string | null;
  createdAt: string;
};

export async function cmdPlaybookChecks(
  config: HxConfig,
  ruleId: string,
  args: string[],
): Promise<void> {
  const jsonOutput = hasFlag(args, "--json");

  const result = (await hxFetch(config, `/playbook/rules/${ruleId}/checks`, {
    basePath: "/api",
  })) as { checks: CheckRecord[] };

  const checks = result.checks;

  if (jsonOutput) {
    console.log(JSON.stringify(checks, null, 2));
    return;
  }

  if (checks.length === 0) {
    console.log("No checks found for this rule.");
    return;
  }

  console.log(`${"ID".padEnd(28)} ${"Status".padEnd(8)} ${"Compliance".padEnd(12)} Checked At`);
  console.log(`${"-".repeat(28)} ${"-".repeat(8)} ${"-".repeat(12)} ${"-".repeat(24)}`);

  for (const check of checks) {
    const id = check.id.length > 25 ? `${check.id.slice(0, 25)}...` : check.id.padEnd(28);
    const status = check.status.padEnd(8);
    const rate = check.complianceRate != null ? `${check.complianceRate}%`.padEnd(12) : "-".padEnd(12);
    const date = check.checkedAt ?? check.createdAt;
    console.log(`${id} ${status} ${rate} ${date}`);
  }
}
