import { inspect } from "util";
import { pullsInMilestone } from "./src/queries/pullsInMilestone";

export async function main() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("Boooh!");
    process.exit(1);
  }

  const result = await pullsInMilestone(301);

  console.log(inspect(result, false, 10));
}

main();
