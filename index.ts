import { writeFile } from "fs/promises";
import { inspect } from "util";
import { Milestone } from "./src/@types/Github";
import { processMilestoneData } from "./src/processing/processMilestoneData";
import { fetchMilestone } from "./src/queries/fetchMilestone";

// This is a read-only token for the public repo
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";

export async function main(milestoneId: number) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("Boooh!");
    process.exit(1);
  }

  console.log("Fetching data from Github...");
  const githubResult = await fetchMilestone(milestoneId);
  // const githubResult2 = await fetchMilestone(milestoneId);

  console.log("Writing to log file...");
  await writeFile("./log.js", JSON.stringify(githubResult, null, 2));

  // console.log(inspect(result, false, 10));

  // eslint-disable-next-line
  // const githubResult: Milestone = require("./log.js");

  const processedMilestone = processMilestoneData(githubResult);

  await writeFile("./milestone.json", JSON.stringify(processedMilestone));

  // WIP: process a timeline of PR events in the milestone
  // const events = processMilestoneTimeline(processedMilestone);

  // await writeFile("./events.json", JSON.stringify(events));
}

const TARGET_MILESTONE = 313;

main(TARGET_MILESTONE);
