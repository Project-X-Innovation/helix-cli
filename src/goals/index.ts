import type { HxConfig } from "../lib/config.js";
import { isHelpRequested } from "../lib/flags.js";
import { cmdGoalsCreate } from "./create.js";
import { cmdGoalsList } from "./list.js";
import { cmdGoalsGet } from "./get.js";
import { cmdGoalsTerminate } from "./terminate.js";

function goalsUsage(exitCode: number = 1): never {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Usage:
  hlx goals create --title <title> --description <desc> [--repos <name1,name2>] [--max-children <n>] [--require-approval] [--sprint <id>]
  hlx goals list [--status <status>] [--limit <n>] [--json]
  hlx goals get <goalId> [--json]
  hlx goals terminate <goalId> --verdict <complete|failed>`);
  process.exit(exitCode);
}

export async function runGoals(config: HxConfig, args: string[]): Promise<void> {
  const subcommand = args[0];
  const rest = args.slice(1);

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    goalsUsage(0);
  }

  switch (subcommand) {
    case "create":
      if (isHelpRequested(rest)) {
        console.log("Usage: hlx goals create --title <title> --description <desc> [--repos <name1,name2>] [--max-children <n>] [--require-approval] [--sprint <id>]");
        process.exit(0);
      }
      await cmdGoalsCreate(config, rest);
      break;

    case "list":
      if (isHelpRequested(rest)) {
        console.log("Usage: hlx goals list [--status <status>] [--limit <n>] [--json]");
        process.exit(0);
      }
      await cmdGoalsList(config, rest);
      break;

    case "get": {
      if (isHelpRequested(rest)) {
        console.log("Usage: hlx goals get <goalId> [--json]");
        process.exit(0);
      }
      const goalId = rest[0];
      if (!goalId || goalId.startsWith("--")) {
        console.error("Error: <goalId> is required. Usage: hlx goals get <goalId> [--json]");
        process.exit(1);
      }
      await cmdGoalsGet(config, goalId, rest.slice(1));
      break;
    }

    case "terminate": {
      if (isHelpRequested(rest)) {
        console.log("Usage: hlx goals terminate <goalId> --verdict <complete|failed>");
        process.exit(0);
      }
      const goalId = rest[0];
      if (!goalId || goalId.startsWith("--")) {
        console.error("Error: <goalId> is required. Usage: hlx goals terminate <goalId> --verdict <complete|failed>");
        process.exit(1);
      }
      await cmdGoalsTerminate(config, goalId, rest.slice(1));
      break;
    }

    default:
      if (subcommand) console.error(`Unknown goals command: ${subcommand}`);
      goalsUsage();
  }
}
