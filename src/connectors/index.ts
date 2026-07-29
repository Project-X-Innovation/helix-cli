import { getFlag, isHelpRequested } from "../lib/flags.js";
import { resolveConnectorAuth } from "./resolve.js";
import { ConnectorApiError, formatConnectorError } from "./http.js";
import { cmdConnectorsList } from "./list.js";
import { cmdConnectorsSkill } from "./skill.js";
import { cmdConnectorsSchema } from "./schema.js";
import { cmdConnectorsRead, collectParams } from "./read.js";

/** Flags on `hlx connectors` subcommands that take a value. */
const VALUE_FLAGS = new Set(["--url", "--token", "--limit", "--cursor", "--id", "--param"]);

/** Positional args, skipping value-taking flags and their values (handles repeated --param). */
function positionals(args: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      if (VALUE_FLAGS.has(arg)) i++; // skip the flag's value too
      continue;
    }
    result.push(arg);
  }
  return result;
}

function connectorsUsage(exitCode: number = 1): never {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Usage:
  hlx connectors list                          List connectors enabled for the org
  hlx connectors skill <name>                  Print the connector's SKILL.md
  hlx connectors schema <name> [resource]      Print the connector's $schema (whole, or one resource)
  hlx connectors read <name> <resource> [--limit N] [--cursor C] [--param key=value ...]
  hlx connectors read <name> <resource> --id <id>   Fetch a single record

Common flags (all subcommands):
  --url <server>     Gateway server URL (default: HELIX_CONNECT_URL env, then current org's url)
  --token <hct_...>  Connector token (default: HELIX_CONNECTOR_TOKEN env)

Connectors are read-only: everything outbound is a play.`);
  process.exit(exitCode);
}

export async function runConnectors(args: string[]): Promise<void> {
  const subcommand = args[0];
  const rest = args.slice(1);

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    connectorsUsage(0);
  }

  try {
    switch (subcommand) {
      case "list": {
        if (isHelpRequested(rest)) {
          console.log("Usage: hlx connectors list [--url <server>] [--token <hct_...>]");
          process.exit(0);
        }
        const auth = resolveConnectorAuth(rest);
        await cmdConnectorsList(auth);
        break;
      }

      case "skill": {
        if (isHelpRequested(rest)) {
          console.log("Usage: hlx connectors skill <name> [--url <server>] [--token <hct_...>]");
          process.exit(0);
        }
        const [name] = positionals(rest);
        if (!name) {
          console.error("Error: <name> is required. Usage: hlx connectors skill <name>");
          process.exit(1);
        }
        const auth = resolveConnectorAuth(rest);
        await cmdConnectorsSkill(auth, name);
        break;
      }

      case "schema": {
        if (isHelpRequested(rest)) {
          console.log("Usage: hlx connectors schema <name> [resource] [--url <server>] [--token <hct_...>]");
          process.exit(0);
        }
        const [name, resource] = positionals(rest);
        if (!name) {
          console.error("Error: <name> is required. Usage: hlx connectors schema <name> [resource]");
          process.exit(1);
        }
        const auth = resolveConnectorAuth(rest);
        await cmdConnectorsSchema(auth, name, resource);
        break;
      }

      case "read": {
        if (isHelpRequested(rest)) {
          console.log(`Usage: hlx connectors read <name> <resource> [--limit N] [--cursor C] [--param key=value ...]
       hlx connectors read <name> <resource> --id <id>

Prints one page of rows as JSON (including nextCursor when more pages exist),
or a single record with --id.`);
          process.exit(0);
        }
        const [name, resource] = positionals(rest);
        if (!name || !resource) {
          console.error("Error: <name> and <resource> are required. Usage: hlx connectors read <name> <resource> [--limit N] [--cursor C] [--param key=value ...] [--id <id>]");
          process.exit(1);
        }
        const auth = resolveConnectorAuth(rest);
        await cmdConnectorsRead(auth, name, resource, {
          id: getFlag(rest, "--id"),
          limit: getFlag(rest, "--limit"),
          cursor: getFlag(rest, "--cursor"),
          params: collectParams(rest),
        });
        break;
      }

      default:
        if (subcommand) console.error(`Unknown connectors command: ${subcommand}`);
        connectorsUsage();
    }
  } catch (error) {
    if (error instanceof ConnectorApiError) {
      console.error(`Error: ${formatConnectorError(error)}`);
    } else {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    process.exit(1);
  }
}
