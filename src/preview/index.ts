import type { HxConfig } from "../lib/config.js";
import { isHelpRequested } from "../lib/flags.js";
import { extractTicketRef, resolveTicket } from "../lib/resolve-ticket.js";
import { cmdPreviewDbUrl } from "./db-url.js";

function previewUsage(exitCode: number = 1): never {
  const output = exitCode === 0 ? console.log : console.error;
  output(`Usage:
  hlx preview db-url <ticket-ref>   Print the Neon preview branch connection URI

Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).`);
  process.exit(exitCode);
}

export async function runPreview(config: HxConfig, args: string[]): Promise<void> {
  const subcommand = args[0];
  const rest = args.slice(1);

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    previewUsage(0);
  }

  switch (subcommand) {
    case "db-url": {
      if (isHelpRequested(rest)) {
        console.log(
          "Usage: hlx preview db-url <ticket-ref>\n\nPrint the Neon preview branch connection URI for a ticket.\nTicket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).\n\nExit codes:\n  0  URI printed to stdout\n  1  Error (details on stderr)",
        );
        process.exit(0);
      }
      const rawRef = extractTicketRef(rest);
      const resolved = await resolveTicket(config, rawRef);
      await cmdPreviewDbUrl(config, resolved.id);
      break;
    }

    default:
      if (subcommand) console.error(`Unknown preview command: ${subcommand}`);
      previewUsage();
  }
}
