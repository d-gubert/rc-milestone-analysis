import Statistics from "statistics.js";
import { Milestone } from "../../@types/Github";
import { processPullRequestData } from "./processPullRequestData";

export function processMilestoneData(milestone: Milestone) {
  const processedMilestone = {
    title: milestone.title,
    url: milestone.url,
    dueOn: milestone.dueOn ? new Date(milestone.dueOn) : null,
    createdAt: new Date(milestone.createdAt),
    closedAt: milestone.closedAt ? new Date(milestone.closedAt) : null,
    state: milestone.state,
    meanTimeToComplete: Infinity,
    meanTimeToQA: Infinity,
    meanTimeToApproval: Infinity,
    meanTimeToReview: Infinity,
    meanTimeApprovalToMerge: Infinity,
    pullRequests: [],
  };

  const processedPullRequests = milestone.pullRequests.nodes.map(processPullRequestData);

  processedMilestone.meanTimeToComplete = Statistics.winsorisedMean(
    pickFinite(processedPullRequests, "timeToComplete"),
    0.1,
  );

  processedMilestone.meanTimeToQA = Statistics.winsorisedMean(
    pickFinite(processedPullRequests, "timeToQA"),
    0.1,
  );

  processedMilestone.meanTimeToApproval = Statistics.winsorisedMean(
    pickFinite(processedPullRequests, "timeToApproval"),
    0.1,
  );

  processedMilestone.meanTimeToReview = Statistics.winsorisedMean(
    pickFinite(processedPullRequests, "timeToReview"),
    0.1,
  );

  processedMilestone.meanTimeApprovalToMerge = Statistics.winsorisedMean(
    pickFinite(processedPullRequests, "timeApprovalToMerge"),
    0.1,
  );

  processedMilestone.pullRequests = processedPullRequests;

  return processedMilestone;
}

function pickFinite<T = Record<string, any>>(source: Array<T>, key: string): Array<number> {
  return source.map((v) => v[key]).filter(Number.isFinite);
}
