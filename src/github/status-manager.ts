import * as core from "@actions/core";

export class StatusManager {
  public static enforceBlock(violationCount: number): void {
    const message = `[AICA_POLICY_ENFORCEMENT] Detected ${violationCount} instance(s) of implicit coupling. Extensional equivalence broken. PR merge blocked.`;
    core.setFailed(message);
  }

  public static reportSuccess(): void {
    core.info("[AICA_VERIFICATION] Zero implicit state violations detected. Extensional semantics preserved.");
  }
}
