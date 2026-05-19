import * as core from "@actions/core";
import * as github from "@actions/github";
import { AstDependencySlicer } from "./core/ast-slicer";
import { ExtensionalProjector } from "./core/extensional-projector";
import { PromptGenerator } from "./llm/prompt-generator";
import { PullRequestReviewer } from "./github/pr-reviewer";
import { StatusManager } from "./github/status-manager";

async function run(): Promise<void> {
  try {
    const token = core.getInput("github-token", { required: true });
    const rulesPath = core.getInput("rules-path", { required: true });
    const context = github.context;

    if (context.eventName !== "pull_request") {
      core.info("AICA Gatekeeper strictly operates on pull_request events. Bypassing execution.");
      return;
    }

    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
      throw new Error("Pull Request context is undefined.");
    }

    const slicer = new AstDependencySlicer(rulesPath);
    const projector = new ExtensionalProjector();
    const reviewer = new PullRequestReviewer(token);

    const modifiedFiles = [
      { path: "src/services/UserService.ts", content: "..." }
    ];

    let totalViolations = 0;

    for (const file of modifiedFiles) {
      const violations = slicer.sliceAndDetect(file.path, file.content);
      
      for (const violation of violations) {
        totalViolations++;
        const ir = projector.projectToExplicit(violation);
        const prompt = PromptGenerator.generateAntiCorruptionPrompt(ir);
        
        await reviewer.postConstraintPrompt(
          context.repo.owner,
          context.repo.repo,
          pullRequest.number,
          pullRequest.head.sha,
          violation.file,
          violation.line,
          prompt
        );
      }
    }

    if (totalViolations > 0) {
      StatusManager.enforceBlock(totalViolations);
    } else {
      StatusManager.reportSuccess();
    }
  } catch (error: any) {
    core.setFailed(`[AICA_FATAL_EXCEPTION] ${error.message}`);
  }
}

run();
