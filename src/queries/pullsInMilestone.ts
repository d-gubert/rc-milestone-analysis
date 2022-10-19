import { Milestone, ResponseData } from "../@types/Github";
import { getOctokitClient } from "../lib/octoClient";

export async function pullsInMilestone(milestoneNumber: number): Promise<Milestone | null> {
  const octo = getOctokitClient();

  return octo.graphql<ResponseData>(
    `
      query pullsInMilestone($milestoneNumber: Int!) {
        repository(owner: "RocketChat", name: "Rocket.Chat") {
          milestone(number: $milestoneNumber) {
            title
            state
            createdAt
            closedAt
            dueOn
            url
            pullRequests(first: 100) {
              totalCount
              nodes {
                number
                title
                url
                createdAt
                mergedAt
                timelineItems(
                  last: 100
                  itemTypes: [
                    READY_FOR_REVIEW_EVENT,
                    REVIEW_REQUESTED_EVENT,
                    CONVERT_TO_DRAFT_EVENT,
                    PULL_REQUEST_REVIEW,
                    MILESTONED_EVENT,
                    DEMILESTONED_EVENT,
                    LABELED_EVENT,
                    UNLABELED_EVENT
                  ]
                ) {
                  totalCount
                  nodes {
                    __typename
                    ... on PullRequestReview {
                      submittedAt
                      author {
                        ... on User {
                          name
                          url
                        }
                      }
                      state
                    }
                    ... on ReadyForReviewEvent {
                      createdAt
                      actor {
                        ... on User {
                          name
                          url
                        }
                      }
                    }
                    ... on ConvertToDraftEvent {
                      createdAt
                      actor {
                        ... on User {
                          name
                          url
                        }
                      }
                    }
                    ... on ReviewRequestedEvent {
                      createdAt
                      actor {
                        ... on User {
                          name
                          url
                        }
                      }
                      requestedReviewer {
                        __typename
                        ... on User {
                          name
                          url
                        }
                        ... on Team {
                          name
                          url
                        }
                      }
                    }
                    ... on MilestonedEvent {
                      createdAt
                      milestoneTitle
                    }
                    ... on DemilestonedEvent {
                      createdAt
                      milestoneTitle
                    }
                    ... on LabeledEvent {
                      createdAt
                      label {
                        name
                      }
                      actor {
                        ... on User {
                          name
                          url
                        }
                      }
                    }
                    ... on UnlabeledEvent {
                      createdAt
                      label {
                        name
                      }
                      actor {
                        ... on User {
                          name
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { milestoneNumber },
  ).then(((response) => response.repository.milestone || null));
}
