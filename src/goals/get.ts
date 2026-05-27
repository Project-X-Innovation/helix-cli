import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { hasFlag } from "../lib/flags.js";

type ChildTicket = {
  id: string;
  shortId: string;
  title: string;
  status: string;
  childType: string | null;
};

type GoalEvaluation = {
  id: string;
  verdict: string;
  createdAt: string;
};

type GoalRoadmap = {
  completed_summary: string | null;
  current_assessment: string | null;
  projected_remaining: string[] | null;
};

type GoalDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  maxChildren: number;
  requireApproval: boolean;
  roadmap: GoalRoadmap | null;
  previews: unknown | null;
  childTickets: ChildTicket[];
  latestEvaluation: GoalEvaluation | null;
  createdAt: string;
  updatedAt: string;
};

type GoalResponse = { goal: GoalDetail };

export function printGoalDetail(goal: GoalDetail): void {
  console.log(`Title:          ${goal.title}`);
  console.log(`ID:             ${goal.id}`);
  console.log(`Status:         ${goal.status}`);
  console.log(`Max Children:   ${goal.maxChildren}`);
  console.log(`Approval Mode:  ${goal.requireApproval ? "enabled" : "disabled"}`);
  console.log(`Children:       ${goal.childTickets?.length ?? 0}`);

  // Latest evaluation
  console.log(`\nLatest Evaluation:`);
  if (goal.latestEvaluation) {
    console.log(`  Verdict:      ${goal.latestEvaluation.verdict}`);
  } else {
    console.log(`  Verdict:      none`);
  }

  // Child tickets
  if (goal.childTickets && goal.childTickets.length > 0) {
    console.log(`\nChild Tickets:`);
    for (const child of goal.childTickets) {
      const idAbbr = child.id.slice(0, 8) + "...";
      const childType = child.childType ?? "ticket";
      console.log(`  ${child.shortId ?? idAbbr}  ${child.status.padEnd(18)}  ${childType.padEnd(10)}  ${child.title}`);
    }
  }

  // Roadmap
  console.log(`\nRoadmap:`);
  if (goal.roadmap) {
    console.log(`  Completed:  ${goal.roadmap.completed_summary ?? "none"}`);
    console.log(`  Current:    ${goal.roadmap.current_assessment ?? "none"}`);
    const remaining = goal.roadmap.projected_remaining;
    console.log(`  Remaining:  ${remaining && remaining.length > 0 ? remaining.join(", ") : "none"}`);
  } else {
    console.log(`  Completed:  none`);
    console.log(`  Current:    none`);
    console.log(`  Remaining:  none`);
  }

  // Description (truncated)
  if (goal.description) {
    const desc = goal.description.length > 500 ? goal.description.slice(0, 500) + "..." : goal.description;
    console.log(`\nDescription:\n${desc}`);
  }
}

export async function cmdGoalsGet(config: HxConfig, goalId: string, args: string[]): Promise<void> {
  const jsonOutput = hasFlag(args, "--json");

  const data = (await hxFetch(config, `/goals/${goalId}`, { basePath: "/api" })) as GoalResponse;

  if (jsonOutput) {
    console.log(JSON.stringify(data.goal, null, 2));
  } else {
    printGoalDetail(data.goal);
  }
}
