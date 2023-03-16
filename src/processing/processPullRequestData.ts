import { PullRequestsNode, TimelineItemsNode } from "../@types/Github";

export interface ProcessedPullRequest {
  number: number;
  title: string;
  url: string;
  createdAt: Date;
  mergedAt: Date;
  closedAt: Date;
  /**
   * The date the PR was converted from draft, marked
   * as ready for review. If it was never a draft, then
   * this is the date the PR was created.
   */
  lastReadyForReviewAt: Date | null;
  lastAddedToMilestoneAt: Date | null;
  firstReviewRequestedAt: Date | null;
  firstReviewAt: Date | null;
  lastApprovedAt: Date | null;
  lastQATestedAt: Date | null;
  changesRequestedCount: number;
  /**
   * Measured in days.
   * If negative, means the PR was reviewed
   * before there was a request for review
   */
  timeToReview: number;
  /**
   * Measured in days.
   * Time it took for the QA to approve the PR, from
   * the time it was ready for review.
   */
  timeToQA: number;
  /**
   * If there are multiple reviews, the time between the
   * first and the approval review.
   * Otherwise, will be the same as time to review
   */
  timeToApproval: number;
  /**
   * The time between last approval and merge. Due to
   * the time it takes for CI to complete, this can be
   * longer than expected.
   */
  timeApprovalToMerge: number;
  /**
   * Time from PR open to merged
   */
  timeToComplete: number;
}

export function processPullRequestData(pullRequest: PullRequestsNode): ProcessedPullRequest {
  const pullRequestData: ProcessedPullRequest = {
    number: pullRequest.number,
    title: pullRequest.title,
    url: pullRequest.url,
    createdAt: new Date(pullRequest.createdAt),
    mergedAt: pullRequest.mergedAt ? new Date(pullRequest.mergedAt) : null,
    closedAt: pullRequest.closedAt ? new Date(pullRequest.closedAt) : null,
    lastReadyForReviewAt: null,
    lastAddedToMilestoneAt: null,
    firstReviewRequestedAt: null,
    firstReviewAt: null,
    lastApprovedAt: null,
    lastQATestedAt: null,
    changesRequestedCount: 0,
    /**
     * Measured in days.
     * If negative, means the PR was reviewed
     * before there was a request for review
     */
    timeToReview: Infinity,
    /**
     * Measured in days.
     * Time it took for the QA to approve the PR
     */
    timeToQA: Infinity,
    /**
     * If there are multiple reviews, the time between the
     * first and the approval review.
     * Otherwise, will be the same as time to review
     */
    timeToApproval: Infinity,
    /**
     * The time between last approval and merge. Due to
     * the time it takes for CI to complete, this can be
     * longer than expected.
     */
    timeApprovalToMerge: NaN,
    /**
     * Time from PR open to merged
     */
    timeToComplete: Infinity,
  };

  const timelineItems = pullRequest.timelineItems.nodes;

  timelineItems.forEach((item) => processPullRequestTimelineItem(item, pullRequestData));

  calculateTimeToEvents(pullRequestData);

  return pullRequestData;
}

function calculateTimeToEvents(pullRequestData: ProcessedPullRequest) {
  // Let's agree to modify the parameter this time
  /* eslint-disable no-param-reassign */

  // If there wasn't a ready for review event, then the PR was created ready for review
  if (!pullRequestData.lastReadyForReviewAt) {
    pullRequestData.lastReadyForReviewAt = pullRequestData.createdAt;
  }

  if (pullRequestData.firstReviewAt) {
    pullRequestData.timeToReview = (
      // Date arithmetics work
      // @ts-ignore
      pullRequestData.firstReviewAt - pullRequestData.lastReadyForReviewAt
    ) / 1000 / 60 / 60 / 24;
  }

  if (pullRequestData.lastApprovedAt?.valueOf() !== pullRequestData.firstReviewAt?.valueOf()) {
    pullRequestData.timeToApproval = (
      // Date arithmetics work
      // @ts-ignore
      pullRequestData.lastApprovedAt - pullRequestData.firstReviewAt
    ) / 1000 / 60 / 60 / 24;
  } else {
    pullRequestData.timeToApproval = pullRequestData.timeToReview;
  }

  if (pullRequestData.lastApprovedAt) {
    pullRequestData.timeApprovalToMerge = (
      // Date arithmetics work
      // @ts-ignore
      pullRequestData.mergedAt - pullRequestData.lastApprovedAt
    ) / 1000 / 60 / 60 / 24;
  }

  if (pullRequestData.mergedAt) {
    pullRequestData.timeToComplete = (
      // Date arithmetics work
      // @ts-ignore
      pullRequestData.mergedAt - pullRequestData.createdAt
    ) / 1000 / 60 / 60 / 24;
  }

  if (pullRequestData.lastQATestedAt) {
    pullRequestData.timeToQA = (
      // Date arithmetics work
      // @ts-ignore
      pullRequestData.lastQATestedAt - pullRequestData.lastReadyForReviewAt
    ) / 1000 / 60 / 60 / 24;
  }

  /* eslint-enable no-param-reassign */
}

function processPullRequestTimelineItem(
  timelineItem: TimelineItemsNode,
  pullRequestData: Record<string, any>,
) {
  // Let's agree to modify the parameter this time
  /* eslint-disable no-param-reassign */

  // can't control payload from third party Mr. Linter
  // eslint-disable-next-line no-underscore-dangle
  switch (timelineItem.__typename) {
    case "MilestonedEvent":
      pullRequestData.lastAddedToMilestoneAt = new Date(timelineItem.createdAt);
      break;
    case "ReadyForReviewEvent":
      pullRequestData.lastReadyForReviewAt = new Date(timelineItem.createdAt);
      break;
    case "ConvertToDraftEvent":
      pullRequestData.lastReadyForReviewAt = null;
      break;
    case "ReviewRequestedEvent":
      if (!pullRequestData.firstReviewRequestedAt) {
        pullRequestData.firstReviewRequestedAt = new Date(timelineItem.createdAt);
      }
      break;
    case "LabeledEvent":
      if (timelineItem.label.name === "stat: QA tested") {
        pullRequestData.lastQATestedAt = new Date(timelineItem.createdAt);
      }
      break;
    case "PullRequestReview":
      if (!pullRequestData.firstReviewAt) {
        pullRequestData.firstReviewAt = new Date(timelineItem.submittedAt);
      }

      if (timelineItem.state === "APPROVED") {
        pullRequestData.lastApprovedAt = new Date(timelineItem.submittedAt);
      }

      if (timelineItem.state === "CHANGES_REQUESTED") {
        pullRequestData.changesRequestedCount += 1;
      }
      break;
    default:
      break;
  }

  /* eslint-enable no-param-reassign */
}
