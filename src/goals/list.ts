import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { getFlag, hasFlag } from "../lib/flags.js";

type GoalListItem = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  _count: { childTickets: number };
  description: string;
};

type GoalsListResponse = { items: GoalListItem[] };

export async function cmdGoalsList(config: HxConfig, args: string[]): Promise<void> {
  const jsonOutput = hasFlag(args, "--json");
  const statusFilter = getFlag(args, "--status");
  const limitRaw = getFlag(args, "--limit");
  const limit = limitRaw !== undefined ? parseInt(limitRaw, 10) : 20;

  const queryParams: Record<string, string> = {};
  if (statusFilter) {
    queryParams.status = statusFilter;
  }

  const data = (await hxFetch(config, "/goals", {
    basePath: "/api",
    queryParams,
  })) as GoalsListResponse;

  let items = data.items;

  // Client-side limit (server does not support pagination)
  if (limit > 0) {
    items = items.slice(0, limit);
  }

  if (items.length === 0) {
    if (jsonOutput) {
      console.log("[]");
    } else {
      console.log("No goals found.");
    }
    return;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  for (const item of items) {
    const idAbbr = item.id.slice(0, 8) + "...";
    const childCount = item._count?.childTickets ?? 0;
    const updated = new Date(item.updatedAt).toLocaleString();
    console.log(`${idAbbr}  ${item.status.padEnd(18)}  ${childCount} children  ${updated}  ${item.title}`);
  }
}
