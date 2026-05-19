import * as github from "@actions/github";

export class PullRequestReviewer {
  private octokit: ReturnType<typeof github.getOctokit>;

  constructor(token: string) {
    this.octokit = github.getOctokit(token);
  }

  public async postConstraintPrompt(
    owner: string,
    repo: string,
    pullNumber: number,
    commitId: string,
    filePath: string,
    line: number,
    promptBody: string
  ): Promise<void> {
    try {
      await this.octokit.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: commitId,
        path: filePath,
        line: line,
        side: "RIGHT",
        body: promptBody,
      });
    } catch (error) {
      console.error(`[AICA_SYSTEM_ERROR] Failed to inject constraint prompt at ${filePath}:${line}.`, error);
      throw error;
    }
  }
}
