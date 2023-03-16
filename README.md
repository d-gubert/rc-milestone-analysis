# rc-milestone-analysis
A script for analyzing how a specific milestone has fared during the development cycle

## Current history files

The raw data of both milestones `5.2` and `6.0` has been processed and stored as json files in their respective folders.

# How to run

Clone the repo, install the dependencies and run `npm start`.

```
$ ; Clone the repo
$ ; cd into folder
$ npm install
$ npm start
```

## Configuration

The script is hardcoded with the [milestone id for 6.0.0 ](https://github.com/RocketChat/Rocket.Chat/milestone/313?closed=1). To change the milestone, check the `TARGET_MILESTONE` const in the `index.ts` file.

The script uses my own read-only token for the queries. You can override that by setting the `GITHUB_TOKEN` environment variable.

# Known Issues

The Graphql query is limited to 100 PRs. If the target milestone has more than those, changes will need to be made to the query.
