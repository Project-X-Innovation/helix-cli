import type { HxConfig } from "../lib/config.js";
import { isHelpRequested } from "../lib/flags.js";
import { cmdPlaybookCheck } from "./check.js";
import { cmdPlaybookChecks } from "./checks.js";
import { parseApiError } from "../goals/utils.js";

function playbookUsage(exitCode: number = 1): never {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Usage:
  hlx playbook check <ruleId> [--json]    Trigger a compliance check and poll to completion
  hlx playbook checks <ruleId> [--json]   List check history for a rule`);
  process.exit(exitCode);
}

export async function runPlaybook(config: HxConfig, args: string[]): Promise<void> {
  const subcommand = args[0];
  const rest = args.slice(1);

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    playbookUsage(0);
  }

  try {
    switch (subcommand) {
      case "check": {
        if (isHelpRequested(rest)) {
          console.log("Usage: hlx playbook check <ruleId> [--json]");
          process.exit(0);
        }
        const ruleId = rest[0];
        if (!ruleId || ruleId.startsWith("--")) {
          console.error("Error: <ruleId> is required. Usage: hlx playbook check <ruleId> [--json]");
          process.exit(1);
        }
        await cmdPlaybookCheck(config, ruleId, rest.slice(1));
        break;
      }

      case "checks": {
        if (isHelpRequested(rest)) {
          console.log("Usage: hlx playbook checks <ruleId> [--json]");
          process.exit(0);
        }
        const ruleId = rest[0];
        if (!ruleId || ruleId.startsWith("--")) {
          console.error("Error: <ruleId> is required. Usage: hlx playbook checks <ruleId> [--json]");
          process.exit(1);
        }
        await cmdPlaybookChecks(config, ruleId, rest.slice(1));
        break;
      }

      default:
        if (subcommand) console.error(`Unknown playbook command: ${subcommand}`);
        playbookUsage();
    }
  } catch (error) {
    console.error(`Error: ${parseApiError(error)}`);
    process.exit(1);
  }
}
