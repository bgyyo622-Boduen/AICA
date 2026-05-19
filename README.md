# AICA Neuro-Symbolic Gatekeeper | AICA 神經-符號守門員

> A Deterministic Constraint Compiler for LLM-Assisted Software Engineering.
> 專為大型語言模型輔助開發設計的決定性約束編譯器。

## Introduction / 專案簡介

[EN]
AICA (AI Code Implicit Coupling Audit) is a GitHub Action that operates as a strict Constraint Compiler. It rejects the naive reliance on prompt engineering to prevent AI hallucinations. Instead, it utilizes deterministic Abstract Syntax Tree (AST) dependency slicing to detect "Implicit Coupling" in AI-generated pull requests. When a violation is found, it blocks the merge and automatically injects an "Anti-Corruption Prompt" into the PR, forcing the LLM to refactor the code into pure, explicitly bounded functions.

[ZH]
AICA 是一個封裝為 GitHub Action 的約束編譯器（Constraint Compiler）。本專案拒絕將系統安全建立在脆弱的提示詞工程之上。我們利用決定性的抽象語法樹（AST）依賴切片，精準攔截 AI 生成程式碼中的「隱性耦合（Implicit Coupling）」。當偵測到違規時，系統將強制阻斷 PR 合併，並於違規程式碼處自動注入「防腐提示詞（Anti-Corruption Prompt）」，迫使 LLM 進行可收斂的架構重構。

---

## Theoretical Background / 第一性原理與理論背景

[EN]
Large Language Models (LLMs) are probabilistic token predictors. When applied to enterprise-grade JVM/Node.js monoliths, they often generate code that relies on Implicit States (e.g., ThreadLocal, System.currentTimeMillis, or global caches). Mathematical proofs indicate that under weak memory models, the presence of these hidden contexts leads to Non-confluence. This breaks the bisimulation relationship between intensional and extensional semantics, causing catastrophic, silent failures in asynchronous production environments. 

[ZH]
大型語言模型（LLMs）本質上是基於機率的 Token 預測器。當應用於企業級單體系統時，AI 極易生成依賴「隱性狀態（Implicit States）」的程式碼（如全域變數、執行緒局部狀態或環境熵）。嚴格的數學證明指出：在弱記憶體模型（Weak Memory Model）與異構併發調度下，隱性上下文將導致系統推導喪失匯合性（Non-confluence）。這會徹底破壞內涵語意與外延語意間的互模擬（Bisimulation）關係，進而在生產環境中引發靜默崩潰。

---

## Mechanistic Intervention / 系統機制

[EN]
Do not use probability to fight probability. AICA enforces boundaries through a three-step neuro-symbolic mechanism:
1. Interception (AST Slicing): Scans the PR diff to locate syntax nodes that cross formal isolation boundaries.
2. Projection (Extensionalization): Executes the Extensionalization Operator to calculate how hidden states must be elevated into explicit parameters.
3. Enforcement (Status Blocking & Prompt Injection): Fails the CI/CD pipeline and posts a structured constraint IR (Intermediate Representation) prompt for the AI/developer to apply immediately.

[ZH]
不要用機率去對抗機率。AICA 透過神經-符號機制執行絕對的三階段防禦：
1. 攔截（依賴切片）： 掃描 PR 變更，精確定位違反隔離邊界的 AST 語法節點。
2. 投影（外延化）： 執行外延化投影算子，計算如何將隱蔽狀態強行「提升」為顯式的介面參數。
3. 強制（狀態阻斷與約束注入）： 亮起 CI/CD 紅燈，並自動發布結構化的約束中介表示（IR）提示詞，引導 AI 完成語意修復。

---

## Installation & Usage / 安裝與使用配置

[EN]
To enforce extensional semantics in your repository, add the following workflow to .github/workflows/aica-gatekeeper.yml:

[ZH]
若要於你的專案中強制執行外延語意，請將以下設定檔加入 .github/workflows/aica-gatekeeper.yml：

```yaml
name: AICA Architecture Enforcement

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  verify-extensional-semantics:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Execute AICA Neuro-Symbolic Gatekeeper
        uses: boduen/aica-github-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

```
## Defining Boundaries / 宣告邊界契約
[EN]
AICA relies on static JSON policies (Static Interface Contracts) stored in the rules/ directory. You can customize these policies to define your enterprise's Zero Trust boundaries. Example of banning implicit time coupling:
[ZH]
AICA 仰賴存放於 rules/ 目錄下的靜態 JSON 政策（靜態介面契約）。你可以自定義這些政策，確立企業內部的零信任邊界。以下為阻斷隱性時間耦合的範例：
```json
{
  "policy_name": "Temporal_Decoupling",
  "description": "Ban direct system clock access to maintain extensional equivalence.",
  "severity": "HIGH",
  "illegal_invocations": [
    {
      "pattern": "Date.now",
      "reason": "Implicit temporal dependency. Inject a TimeProvider interface."
    }
  ]
}

```
## Disclaimer / 免責聲明
[EN]
This framework does not "improve AI generation quality." It structurally limits AI generation freedom. If your team prefers moving fast and breaking things without regard for topological software architecture, this tool will heavily degrade your deployment velocity.
[ZH]
本框架的目的不是「提升 AI 生成品質」，而是從結構上剝奪 AI 生成的自由度。如果你的團隊追求不顧拓樸架構的極致開發速度，本工具將嚴重拖慢你的部署節奏。我們只為追求絕對確定性（Absolute Determinism）的工程師服務。
Architected with formal discipline. / 秉持形式化紀律構建。
```

```
