import { Violation } from "./ast-slicer";

export interface ExtensionalIR {
  originalViolation: Violation;
  suggestedAction: string;
  isRecoverable: boolean;
}

export class ExtensionalProjector {
  public projectToExplicit(violation: Violation): ExtensionalIR {
    let action = "";

    if (violation.pattern.includes("ThreadLocal") || violation.pattern.includes("Context")) {
      action = `Define an explicit Context interface and pass it as a parameter. DO NOT read global context natively.`;
    } else if (violation.pattern.includes("Date.now") || violation.pattern.includes("Time")) {
      action = `Inject a TimeProvider or Clock instance to ensure pure function semantics.`;
    } else {
      action = `Remove direct access to ${violation.pattern}. Utilize Dependency Injection (DI) to pass this capability explicitly.`;
    }

    return {
      originalViolation: violation,
      suggestedAction: action,
      isRecoverable: true
    };
  }
}
