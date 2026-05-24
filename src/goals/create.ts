import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { requireFlag, getFlag, hasFlag } from "../lib/flags.js";
import { resolveAllRepos } from "../lib/resolve-repo.js";

type CreateGoalResponse = {
  goal: {
    id: string;
    title: string;
    status: string;
    maxChildren: number;
    requireApproval: boolean;
  };
};

export async function cmdGoalsCreate(config: HxConfig, args: string[]): Promise<void> {
  const title = requireFlag(args, "--title", "--title <title> is required.");
  const description = requireFlag(args, "--description", "--description <text> is required.");

  // --- Optional flags ---
  const reposRaw = getFlag(args, "--repos");
  let repositoryIds: string[] | undefined;

  if (reposRaw) {
    const repoEntries = reposRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    if (repoEntries.length === 0) {
      console.error("Error: --repos requires at least one repository name.");
      process.exit(1);
    }
    try {
      repositoryIds = await resolveAllRepos(config, repoEntries);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      console.error('Run "hlx inspect repos" to see available repositories.');
      process.exit(1);
    }
  }

  const maxChildrenRaw = getFlag(args, "--max-children");
  let maxChildren: number | undefined;
  if (maxChildrenRaw !== undefined) {
    maxChildren = parseInt(maxChildrenRaw, 10);
    if (isNaN(maxChildren) || maxChildren < 1) {
      console.error("Error: --max-children must be a positive integer.");
      process.exit(1);
    }
  }

  const requireApproval = hasFlag(args, "--require-approval");
  const sprintId = getFlag(args, "--sprint");

  let data: CreateGoalResponse;
  try {
    data = (await hxFetch(config, "/goals", {
      method: "POST",
      body: {
        title,
        description,
        ...(repositoryIds && { repositoryIds }),
        ...(maxChildren !== undefined && { maxChildren }),
        ...(requireApproval && { requireApproval }),
        ...(sprintId && { sprintId }),
      },
      basePath: "/api",
    })) as CreateGoalResponse;
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

  console.log(`Goal created:`);
  console.log(`  ID:       ${data.goal.id}`);
  console.log(`  Title:    ${data.goal.title}`);
  console.log(`  Status:   ${data.goal.status}`);
}
