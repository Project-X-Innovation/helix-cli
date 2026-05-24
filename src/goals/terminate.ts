import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { requireFlag } from "../lib/flags.js";
import { parseApiError } from "./utils.js";

type TerminateGoalResponse = {
  goal: {
    id: string;
    title: string;
    status: string;
  };
};

const VALID_VERDICTS = ["complete", "failed"] as const;

export async function cmdGoalsTerminate(config: HxConfig, goalId: string, args: string[]): Promise<void> {
  const verdict = requireFlag(args, "--verdict", "--verdict <complete|failed> is required.");

  if (!(VALID_VERDICTS as readonly string[]).includes(verdict)) {
    console.error(`Error: Invalid verdict "${verdict}". Allowed values: ${VALID_VERDICTS.join(", ")}`);
    process.exit(1);
  }

  let data: TerminateGoalResponse;
  try {
    data = (await hxFetch(config, `/goals/${goalId}/terminate`, {
      method: "POST",
      body: { verdict },
      basePath: "/api",
    })) as TerminateGoalResponse;
  } catch (error) {
    console.error(`Error: ${parseApiError(error)}`);
    process.exit(1);
  }

  console.log(`Goal terminated:`);
  console.log(`  ID:       ${data.goal.id}`);
  console.log(`  Title:    ${data.goal.title}`);
  console.log(`  Status:   ${data.goal.status}`);
  console.log(`  Verdict:  ${verdict}`);
}
