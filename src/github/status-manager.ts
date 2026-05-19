import * as core from "@actions/core";

export class StatusManager {
  /**
   * 強制執行架構阻斷 (Architecture Block Enforcement)
   * 確保違反環境獨立語意 (EISV) 的程式碼無法進入主分支
   */
  public static enforceBlock(violationCount: number): void {
    const message = `[AICA_POLICY_ENFORCEMENT] Detected ${violationCount} instance(s) of implicit coupling. The system has lost extensional equivalence. PR merge is blocked.`;
    core.setFailed(message);
  }

  public static reportSuccess(): void {
    core.info("[AICA_VERIFICATION] Zero implicit state violations detected. Extensional semantics preserved.");
  }
}
