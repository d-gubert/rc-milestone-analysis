import StatisticsConstructor from "statistics.js";
import { Milestone } from "../@types/Github";
import { ProcessedPullRequest, processPullRequestData } from "./processPullRequestData";

const Statistics = new StatisticsConstructor([], {});

export interface ProcessedMilestone {
  title: string;
  url: string;
  dueOn: Date;
  state: string;
  createdAt: Date;
  closedAt: Date;
  meanTimeToComplete: number;
  meanTimeToQA: number;
  meanTimeToApproval: number;
  meanTimeToReview: number;
  meanTimeApprovalToMerge: number;
  totalChangeRequests: number;
  averageChangeRequestPerPR: number;
  regressionCount: number;
  pullRequests: Array<ProcessedPullRequest>;
}

export function processMilestoneData(milestone: Milestone): ProcessedMilestone {
  const processedMilestone: ProcessedMilestone = {
    title: milestone.title,
    url: milestone.url,
    state: milestone.state,
    dueOn: milestone.dueOn ? new Date(milestone.dueOn) : null,
    createdAt: new Date(milestone.createdAt),
    closedAt: milestone.closedAt ? new Date(milestone.closedAt) : null,
    meanTimeToComplete: Infinity,
    meanTimeToQA: Infinity,
    meanTimeToApproval: Infinity,
    meanTimeToReview: Infinity,
    meanTimeApprovalToMerge: Infinity,
    totalChangeRequests: Infinity,
    averageChangeRequestPerPR: Infinity,
    regressionCount: 0,
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

  processedMilestone.regressionCount = processedPullRequests.filter(
    (pr) => pr.title.toLowerCase().includes("regression"),
  ).length;

  processedMilestone.averageChangeRequestPerPR = Statistics.winsorisedMean(
    pickFinite(processedPullRequests, "changesRequestedCount"),
    0.1,
  );

  processedMilestone.totalChangeRequests = processedPullRequests.reduce(
    (acc, pr) => acc + pr.changesRequestedCount,
    0,
  );

  processedMilestone.pullRequests = processedPullRequests;

  return processedMilestone;
}

function pickFinite<T = Record<string, any>>(source: Array<T>, key: string): Array<number> {
  return source.map((v) => v[key]).filter(Number.isFinite);
}
