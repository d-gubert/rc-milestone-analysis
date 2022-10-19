import { PullRequestsNode, TimelineItemsNode } from "../@types/Github";

export function processPullRequestData(pullRequest: PullRequestsNode) {
  const pullRequestData = {
    number: pullRequest.number,
    title: pullRequest.title,
    url: pullRequest.url,
    createdAt: new Date(pullRequest.createdAt),
    mergedAt: pullRequest.mergedAt ? new Date(pullRequest.mergedAt) : null,
    lastAddedToMilestoneAt: null,
    lastReadyForReviewAt: null,
    firstReviewRequestedAt: null,
    firstReviewAt: null,
    lastApprovedAt: null,
    changesRequestedCount: 0,
    timeToReview: Infinity,
    timeToApproval: Infinity,
    timeApprovalToMerge: Infinity,
  } as any;

  const timelineItems = pullRequest.timelineItems.nodes;

  timelineItems.forEach((item) => processPullRequestTimelineItem(item, pullRequestData));

  // If there wasn't a ready for review event, then the PR was created ready for review
  if (!pullRequestData.lastReadyForReviewAt) {
    pullRequestData.lastReadyForReviewAt = pullRequestData.createdAt;
  }

  if (pullRequestData.firstReviewAt) {
    pullRequestData.timeToReview = (
      pullRequestData.firstReviewAt - pullRequestData.lastReadyForReviewAt
    ) / 1000 / 60 / 60 / 24;
  }

  if (pullRequestData.lastApprovedAt?.valueOf() !== pullRequestData.firstReviewAt?.valueOf()) {
    pullRequestData.timeToApproval = (
      pullRequestData.lastApprovedAt - pullRequestData.firstReviewAt
    ) / 1000 / 60 / 60 / 24;
  } else {
    pullRequestData.timeToApproval = pullRequestData.timeToReview;
  }

  if (pullRequestData.lastApprovedAt && pullRequestData.mergedAt) {
    pullRequestData.timeApprovalToMerge = (
      pullRequestData.mergedAt - pullRequestData.lastApprovedAt
    ) / 1000 / 60 / 60 / 24;
  }

  return pullRequestData;
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
