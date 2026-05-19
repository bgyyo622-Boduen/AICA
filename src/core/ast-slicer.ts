import { Project, SyntaxKind, CallExpression } from "ts-morph";
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

  constructor() {
    this.project = new Project();
    this.loadPolicies();
  }

  // 載入靜態介面契約 (The Formal Policies)
  private loadPolicies() {
    const rulesDir = path.join(__dirname, "../../rules");
    const files = fs.readdirSync(rulesDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = fs.readFileSync(path.join(rulesDir, file), "utf-8");
        this.policies.push(JSON.parse(content));
      }
    }
  }

  /**
   * 執行圖譜切片 (Graph Slicing)
   * 攔截隱性狀態 (C_state) 與環境熵 (C_env)
   */
  public sliceAndDetect(filePath: string, sourceCode: string): Violation[] {
    const sourceFile = this.project.createSourceFile(filePath, sourceCode, { overwrite: true });
    const violations: Violation[] = [];

    // 尋找所有的函數呼叫與屬性訪問
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

    const allNodes = [...callExpressions, ...propertyAccesses];

    for (const node of allNodes) {
      const nodeText = node.getText();
      
      for (const policy of this.policies) {
        for (const rule of policy.illegal_invocations) {
          // 若偵測到未宣告的隱性依賴 (Implicit Coupling)
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
