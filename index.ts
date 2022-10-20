import { writeFile } from "fs/promises";
import { inspect } from "util";
import { Milestone } from './src/@types/Github';
import { processPullRequestData } from "./src/lib/processPullRequestData";
import { pullsInMilestone } from "./src/queries/pullsInMilestone";

export async function main() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("Boooh!");
    process.exit(1);
  }

  // console.log("Fetching data from Github...");
  // const githubResult = await pullsInMilestone(301);

  // console.log("Writing to log file...");
  // await writeFile("./log.js", `module.exports = ${inspect(githubResult, { depth: 10 })};`);

  // console.log(inspect(result, false, 10));

  // eslint-disable-next-line
  const githubResult: Milestone = require("./log.js");

  console.log("Processing data...");
  const processedPRs = githubResult.pullRequests.nodes.map(processPullRequestData);

  await writeFile("./processed_prs.json", JSON.stringify(processedPRs));
}

main();
