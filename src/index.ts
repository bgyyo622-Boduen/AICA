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
    const context = github.context;

    if (context.eventName !== "pull_request") {
      core.info("AICA Gatekeeper strictly operates on pull_request events. Bypassing execution.");
      return;
    }

    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
      throw new Error("Pull Request context is undefined.");
    }

    const slicer = new AstDependencySlicer();
    const projector = new ExtensionalProjector();
    const reviewer = new PullRequestReviewer(token);

    // 在實務上，此處應透過 GitHub API 獲取 PR 的 Diff 檔案清單
    // 為簡化展示，我們假設 fetchPrFiles() 回傳被修改的檔案路徑與內容
    const modifiedFiles = [
      { path: "src/services/UserService.ts", content: "..." } // Mock data
    ];

    let totalViolations = 0;

    for (const file of modifiedFiles) {
      // 1. 執行依賴切片
      const violations = slicer.sliceAndDetect(file.path, file.content);
      
      for (const violation of violations) {
        totalViolations++;
        
        // 2. 計算外延化投影算子
        const ir = projector.projectToExplicit(violation);
        
        // 3. 生成反向提示詞
        const prompt = PromptGenerator.generateAntiCorruptionPrompt(ir);
        
        // 4. 於 PR 注入約束
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
