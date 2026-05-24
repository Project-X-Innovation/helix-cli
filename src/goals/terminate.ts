import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { requireFlag } from "../lib/flags.js";

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
    const msg = error instanceof Error ? error.message : String(error);
    const dashIdx = msg.indexOf(" — ");
    if (dashIdx !== -1) {
      const bodyPart = msg.slice(dashIdx + 3);
      try {
        const parsed = JSON.parse(bodyPart);
        if (parsed.error) {
          console.error(`Error: ${parsed.error}`);
          process.exit(1);
        }
      } catch {
        // JSON parse failed — fall through to raw message
      }
    }
    console.error(`Error: ${msg}`);
    process.exit(1);
  }

  console.log(`Goal terminated:`);
  console.log(`  ID:       ${data.goal.id}`);
  console.log(`  Title:    ${data.goal.title}`);
  console.log(`  Status:   ${data.goal.status}`);
  console.log(`  Verdict:  ${verdict}`);
}
