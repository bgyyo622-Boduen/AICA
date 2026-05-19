import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

export interface Violation {
  file: string;
  line: number;
  pattern: string;
  reason: string;
  severity: string;
}

export class AstDependencySlicer {
  private project: Project;
  private policies: any[] = [];

  constructor(private rulesPath: string) {
    this.project = new Project();
    this.loadPolicies();
  }

  private loadPolicies() {
    const resolvedPath = path.resolve(process.cwd(), this.rulesPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`[AICA_FATAL] Policy directory not found at explicit path: ${resolvedPath}`);
    }
    const files = fs.readdirSync(resolvedPath);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = fs.readFileSync(path.join(resolvedPath, file), "utf-8");
        this.policies.push(JSON.parse(content));
      }
    }
  }

  public sliceAndDetect(filePath: string, sourceCode: string): Violation[] {
    const sourceFile = this.project.createSourceFile(filePath, sourceCode, { overwrite: true });
    const violations: Violation[] = [];

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);
    const allNodes = [...callExpressions, ...propertyAccesses];

    for (const node of allNodes) {
      const nodeText = node.getText();
      for (const policy of this.policies) {
        for (const rule of policy.illegal_invocations) {
          if (nodeText.includes(rule.pattern)) {
            violations.push({
              file: filePath,
              line: node.getStartLineNumber(),
              pattern: rule.pattern,
              reason: rule.reason,
              severity: policy.severity
            });
          }
        }
      }
    }
    return violations;
  }
}
