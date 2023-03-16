import { ProcessedMilestone } from "./processMilestoneData";

export interface ProcessedEvent {
  type: string;
  title: string;
  date: Date;
  formattedDate: string;
  targetUrl: string;
  extraData?: Record<string, any>;
}

export function processMilestoneTimeline(milestone: ProcessedMilestone): Array<ProcessedEvent> {
  const dateFormatter = new Intl.DateTimeFormat("pt-BR");

  const events = [
    {
      type: "milestone_created",
      title: "Milestone created",
      date: milestone.createdAt,
      targetUrl: milestone.url,
    },
    {
      type: "milestone_due",
      title: "Milestone Due Date",
      date: milestone.dueOn,
      targetUrl: milestone.url,
    },
    {
      type: "milestone_closed",
      title: "Milestone closed",
      date: milestone.closedAt,
      targetUrl: milestone.url,
    },
  ];

  milestone.pullRequests.forEach((pullRequest) => {
    if (pullRequest.createdAt <= milestone.createdAt) {
      events.push({
        type: "pull_request_created",
        title: "Pull request opened",
        date: pullRequest.createdAt,
        targetUrl: pullRequest.url,
      });
    }

    if (pullRequest.lastAddedToMilestoneAt) {
      events.push({
        type: "pull_request_added_to_milestone",
        title: "Pull request added to milestone",
        date: pullRequest.lastAddedToMilestoneAt,
        targetUrl: pullRequest.url,
      });
    }

    if (pullRequest.lastApprovedAt) {
      events.push({
        type: "pull_request_approved",
        title: "Pull request approved",
        date: pullRequest.lastApprovedAt,
        targetUrl: pullRequest.url,
      });
    }

    if (pullRequest.mergedAt) {
      events.push({
        type: "pull_request_merged",
        title: "Pull request merged",
        date: pullRequest.mergedAt,
        targetUrl: pullRequest.url,
      });
    }

    if (pullRequest.closedAt) {
      events.push({
        type: "pull_request_closed",
        title: "Pull request closed",
        date: pullRequest.closedAt,
        targetUrl: pullRequest.url,
      });
    }
  });

  return events
    .map((event) => ({ ...event, formattedDate: dateFormatter.format(event.date) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
