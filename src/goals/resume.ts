import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { parseApiError } from "./utils.js";

export async function cmdGoalsResume(config: HxConfig, goalId: string): Promise<void> {
  try {
    await hxFetch(config, `/goals/${goalId}/resume`, {
      method: "POST",
      body: {},
      basePath: "/api",
    });
  } catch (error) {
    console.error(`Error: ${parseApiError(error)}`);
    process.exit(1);
  }

  console.log(`Goal resumed successfully.`);
  console.log(`  ID: ${goalId}`);
}
