import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { hasFlag } from "../lib/flags.js";

const POLL_INTERVAL_MS = 5_000;
const MAX_POLLS = 120; // 10 minutes
const TERMINAL_STATUSES = new Set(["PASS", "FAIL", "ERROR"]);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type CheckRecord = {
  id: string;
  ruleId: string;
  organizationId: string;
  status: string;
  interpretation?: string | null;
  queries?: unknown;
  counts?: unknown;
  complianceRate?: number | null;
  compliantExamples?: unknown[] | null;
  violatingExamples?: unknown[] | null;
  error?: string | null;
  runId?: string | null;
  checkedAt?: string | null;
  createdAt: string;
};

function printCheckResult(check: CheckRecord): void {
  console.log(`\nStatus: ${check.status}`);
  if (check.interpretation) {
    console.log(`Interpretation: ${check.interpretation}`);
  }
  if (check.complianceRate != null) {
    console.log(`Compliance Rate: ${check.complianceRate}%`);
  }
  if (check.counts) {
    console.log(`Counts: ${JSON.stringify(check.counts)}`);
  }
  if (check.compliantExamples) {
    console.log(`Compliant Examples: ${Array.isArray(check.compliantExamples) ? check.compliantExamples.length : 0}`);
  }
  if (check.violatingExamples) {
    console.log(`Violating Examples: ${Array.isArray(check.violatingExamples) ? check.violatingExamples.length : 0}`);
  }
  if (check.error) {
    console.log(`Error: ${check.error}`);
  }
}

export async function cmdPlaybookCheck(
  config: HxConfig,
  ruleId: string,
  args: string[],
): Promise<void> {
  const jsonOutput = hasFlag(args, "--json");

  // Trigger the check
  const triggerResult = (await hxFetch(config, `/playbook/rules/${ruleId}/check`, {
    method: "POST",
    basePath: "/api",
  })) as { check: CheckRecord };

  const check = triggerResult.check;
  console.log(`Check started: ${check.id}`);

  // If already terminal (e.g., ERROR for GENERAL org), show result immediately
  if (TERMINAL_STATUSES.has(check.status)) {
    if (jsonOutput) {
      console.log(JSON.stringify(check, null, 2));
    } else {
      printCheckResult(check);
    }
    process.exit(check.status === "PASS" ? 0 : 1);
  }

  // Poll until terminal
  let latestCheck = check;
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);

    const pollResult = (await hxFetch(config, `/playbook/rules/${ruleId}/checks/${check.id}`, {
      basePath: "/api",
    })) as { check: CheckRecord };

    latestCheck = pollResult.check;
    process.stdout.write(".");

    if (TERMINAL_STATUSES.has(latestCheck.status)) {
      process.stdout.write("\n");
      break;
    }
  }

  if (!TERMINAL_STATUSES.has(latestCheck.status)) {
    console.log(`\nTimeout: check did not complete within ${(MAX_POLLS * POLL_INTERVAL_MS) / 60_000} minutes.`);
    console.log(`Last status: ${latestCheck.status}`);
    if (jsonOutput) {
      console.log(JSON.stringify(latestCheck, null, 2));
    }
    process.exit(1);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(latestCheck, null, 2));
  } else {
    printCheckResult(latestCheck);
  }

  process.exit(latestCheck.status === "PASS" ? 0 : 1);
}
