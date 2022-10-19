export interface ResponseData {
  repository: Repository;
}

export interface Repository {
  milestone?: Milestone;
}

export interface Milestone {
  title: string;
  state: string;
  createdAt: Date;
  closedAt: Date;
  dueOn: Date;
  url: string;
  pullRequests: PullRequests;
}

export interface PullRequests {
  totalCount: number;
  nodes: PullRequestsNode[];
}

export interface PullRequestsNode {
  number: number;
  title: string;
  url: string;
  createdAt: Date;
  mergedAt?: Date;
  timelineItems: TimelineItems;
}

export interface TimelineItems {
  totalCount: number;
  nodes: TimelineItemsNode[];
}

export interface TimelineItemsNode {
  __typename: string;
  submittedAt?: Date;
  createdAt?: Date;
  author?: Actor;
  state?: string;
  actor?: Actor;
  requestedReviewer?: RequestedReviewer;
  label?: Label;
  milestoneTitle?: string;
}

export interface Actor {
  name?: string;
  url?: string;
}

export interface Label {
  name: string;
}

export interface RequestedReviewer {
  __typename: string;
  name: string;
  url: string;
}
