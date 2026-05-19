import { ExtensionalIR } from "../core/extensional-projector";

export class ConstraintIRBuilder {
  public static build(ir: ExtensionalIR): string {
    return `[AICA_CONSTRAINT_VIOLATION]
- File: ${ir.originalViolation.file} (Line ${ir.originalViolation.line})
- Target: ${ir.originalViolation.pattern}
- Severity: ${ir.originalViolation.severity}
- Reason: ${ir.originalViolation.reason}`;
  }
}
