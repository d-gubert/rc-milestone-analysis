import { Octokit } from "octokit";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

let instance: Octokit = null;

export function getOctokitClient() {
  if (!instance) {
    instance = new (Octokit.plugin(restEndpointMethods))({ auth: process.env.GITHUB_TOKEN });
  }

  return instance;
}
