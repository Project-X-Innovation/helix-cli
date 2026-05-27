#!/usr/bin/env node

/**
 * CLI Surface Coverage Checker
 *
 * Recursively walks `node dist/index.js --help` and all subcommands,
 * extracts tokens (subcommand names, long-form flags, enum values),
 * and asserts every token appears in SKILL.md or references/commands.md.
 *
 * Exit codes:
 *   0 — all tokens covered
 *   1 — missing tokens (listed to stderr)
 *   2 — script error (build failure, unreadable files, unparseable help)
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const CLI_ENTRY = join(ROOT, "dist", "index.js");
const SKILL_MD = join(ROOT, "skill-content", "SKILL.md");
const COMMANDS_MD = join(ROOT, "skill-content", "references", "commands.md");

/**
 * Run a --help command and capture output (both stdout and stderr).
 */
function runHelp(cmdParts) {
  const cmd = ["node", CLI_ENTRY, ...cmdParts, "--help"].join(" ");
  try {
    const stdout = execSync(cmd, {
      encoding: "utf8",
      timeout: 15_000,
      env: { ...process.env, HLX_SKIP_UPDATE_CHECK: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    return stdout;
  } catch (err) {
    // Help may exit with non-zero; capture stdout and stderr
    if (err.stdout || err.stderr) {
      return (err.stdout || "") + "\n" + (err.stderr || "");
    }
    return "";
  }
}

/**
 * Extract long-form flags from help text.
 * Matches --flag-name patterns.
 */
function extractFlags(text) {
  const flags = new Set();
  const re = /--([a-z][a-z0-9-]*)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const flag = `--${match[1]}`;
    // Skip --help itself as it's universal
    if (flag !== "--help") {
      flags.add(flag);
    }
  }
  return flags;
}

/**
 * Extract enum values from angle-bracket groups containing pipes.
 * e.g., <AUTO|BUILD|FIX|RESEARCH|EXECUTE> -> [AUTO, BUILD, FIX, RESEARCH, EXECUTE]
 */
function extractEnumValues(text) {
  const enums = new Set();
  // Match <VAL1|VAL2|...> patterns
  const re = /<([^>]+\|[^>]+)>/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const group = match[1];
    for (const val of group.split("|")) {
      const trimmed = val.trim();
      if (trimmed) {
        enums.add(trimmed);
      }
    }
  }
  return enums;
}

/**
 * Extract rating values from prose text.
 * Matches patterns like "Rating values: thumbs-up (up), thumbs-down (down), love"
 */
function extractRatingValues(text) {
  const ratings = new Set();
  const ratingMatch = text.match(/Rating values?:\s*([^\n]+)/i);
  if (ratingMatch) {
    const line = ratingMatch[1];
    // Extract main values and aliases
    const valueRe = /([a-z][-a-z]*)/g;
    let m;
    while ((m = valueRe.exec(line)) !== null) {
      const val = m[1];
      // Only add recognized rating-like values
      if (["thumbs-up", "thumbs-down", "love", "up", "down"].includes(val)) {
        ratings.add(val);
      }
    }
  }
  return ratings;
}

// Words that appear in help output but are not subcommands
const SUBCOMMAND_BLOCKLIST = new Set([
  "Usage:", "Usage", "workbench", "Options:", "Options",
  "Error:", "Error", "Warning:", "Warning",
]);

/**
 * Discover subcommand names from help text for a given prefix.
 * Looks for usage lines like:
 *   hlx <parent> <subcmd>
 *   hlx <parent> subcmd1|subcmd2|subcmd3
 */
function discoverSubcommands(text, prefix) {
  const subcmds = new Set();
  // Match lines starting with the prefix pattern in usage blocks
  const usageRe = new RegExp(`^\\s*hlx\\s+${prefix.length ? prefix.join("\\s+") + "\\s+" : ""}(\\S+)`, "gm");
  let match;
  while ((match = usageRe.exec(text)) !== null) {
    const token = match[1];
    // Skip flags, placeholders, blocklisted words
    if (token.startsWith("-") || token.startsWith("<")) continue;
    if (SUBCOMMAND_BLOCKLIST.has(token)) continue;
    // Must look like a command name (lowercase letters, hyphens, digits)
    if (!/^[a-z][a-z0-9-]*(\|[a-z][a-z0-9-]*)*$/.test(token)) continue;
    // Handle pipe-separated alternatives: current|list|switch
    if (token.includes("|")) {
      for (const alt of token.split("|")) {
        const trimmed = alt.trim();
        if (trimmed && !trimmed.startsWith("-") && !trimmed.startsWith("<")) {
          subcmds.add(trimmed);
        }
      }
    } else {
      subcmds.add(token);
    }
  }
  return subcmds;
}

/**
 * Recursively walk help output and collect all tokens.
 */
function collectTokens(prefix = [], visited = new Set()) {
  const key = prefix.join(" ");
  if (visited.has(key)) return { subcommands: new Set(), flags: new Set(), enums: new Set() };
  visited.add(key);

  const helpText = runHelp(prefix);
  if (!helpText.trim()) {
    if (prefix.length === 0) {
      process.stderr.write(`Error: unrecognized help output for top-level command\n`);
      process.exit(2);
    }
    return { subcommands: new Set(), flags: new Set(), enums: new Set() };
  }

  const allSubcommands = new Set();
  const allFlags = new Set();
  const allEnums = new Set();

  // Extract tokens from this level
  const flags = extractFlags(helpText);
  const enums = extractEnumValues(helpText);
  const ratings = extractRatingValues(helpText);
  const subcmds = discoverSubcommands(helpText, prefix);

  for (const f of flags) allFlags.add(f);
  for (const e of enums) allEnums.add(e);
  for (const r of ratings) allEnums.add(r);
  for (const s of subcmds) allSubcommands.add(s);

  // Recurse into discovered subcommands
  for (const sub of subcmds) {
    // Skip subcommands that look like placeholders or flag values
    if (sub.startsWith("<") || sub.startsWith("-") || sub === "[flags]") continue;

    const childPrefix = [...prefix, sub];
    const childTokens = collectTokens(childPrefix, visited);
    for (const s of childTokens.subcommands) allSubcommands.add(s);
    for (const f of childTokens.flags) allFlags.add(f);
    for (const e of childTokens.enums) allEnums.add(e);
  }

  return { subcommands: allSubcommands, flags: allFlags, enums: allEnums };
}

/**
 * Load doc files and strip backticks for matching.
 */
function loadDocContent() {
  let content = "";
  try {
    content += readFileSync(SKILL_MD, "utf8");
  } catch (err) {
    process.stderr.write(`Error: Cannot read ${SKILL_MD}: ${err.message}\n`);
    process.exit(2);
  }
  try {
    content += "\n" + readFileSync(COMMANDS_MD, "utf8");
  } catch (err) {
    process.stderr.write(`Error: Cannot read ${COMMANDS_MD}: ${err.message}\n`);
    process.exit(2);
  }
  // Strip backticks for matching
  return content.replace(/`/g, "");
}

// ---- Main ----

// Verify the CLI is built
try {
  readFileSync(CLI_ENTRY, "utf8");
} catch {
  process.stderr.write(`Error: CLI not built. Run 'npm ci' or 'npm run build' first.\n`);
  process.stderr.write(`Expected: ${CLI_ENTRY}\n`);
  process.exit(2);
}

process.stderr.write("Collecting CLI surface tokens...\n");

const { subcommands, flags, enums } = collectTokens();

// Combine all tokens for checking
const allTokens = new Map();
for (const s of subcommands) allTokens.set(s, "subcommand");
for (const f of flags) allTokens.set(f, "flag");
for (const e of enums) allTokens.set(e, "enum");

process.stderr.write(`Found ${allTokens.size} tokens (${subcommands.size} subcommands, ${flags.size} flags, ${enums.size} enums)\n`);

// Load doc content
const docContent = loadDocContent();

// Check coverage
const missing = [];
for (const [token, type] of allTokens) {
  if (!docContent.includes(token)) {
    missing.push({ token, type });
  }
}

if (missing.length > 0) {
  process.stderr.write(`\nMissing CLI surface tokens (${missing.length}):\n`);
  for (const { token, type } of missing.sort((a, b) => a.token.localeCompare(b.token))) {
    process.stderr.write(`  [${type}] ${token}\n`);
  }
  process.stderr.write(`\nUpdate skill-content/SKILL.md or skill-content/references/commands.md to include these tokens.\n`);
  process.exit(1);
} else {
  process.stderr.write(`\nAll ${allTokens.size} CLI surface tokens are covered in skill docs.\n`);
  process.exit(0);
}
