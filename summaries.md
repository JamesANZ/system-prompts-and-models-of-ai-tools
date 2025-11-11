# Prompt Summaries

## Amp

### `claude-4-sonnet.yaml`

- Positions the agent as Amp, a Sourcegraph-built coding assistant focused on end-to-end delivery of software tasks with balanced initiative.
- Stresses heavy tool use (search, todo management, oracle) and mandatory diagnostics runs after code changes.
- Enforces concise communication with markdown links to files and discourages unsolicited explanations.

### `gpt-5.yaml`

- Shares Amp’s mission but tuned for GPT-5 with more aggressive expectations on parallel tool use and minimization of visible reasoning.
- Adds strict formatting requirements (2–10 line final status with file:// links) and prioritizes automated planning via todo tracking and oracle/task tools.

## Anthropic

### `Claude Code 2.0.txt`

- Configures Claude Code CLI with defensive-security-only scope, ultra-concise chat replies (≤4 lines), and mandatory TodoWrite planning for multi-step work.
- Prioritizes tool-mediated context gathering, explicit code path references (`file:line`), and directs model to reference Claude Code docs via WebFetch when asked about platform features.

### `Sonnet 4.5 Prompt.txt`

- Extends general Anthropic assistant behavior: conversational balance, intellectual curiosity, respect for cutoff, and empathy guidelines.
- Details broad policy for math reasoning, citation practices, artifact usage, web search, and safety constraints for modern Claude deployments.

## Augment Code

### `claude-4-sonnet-agent-prompts.txt`

- Defines Augment Agent persona with mandatory pre-edit retrieval, structured task management tooling, and XML snippet requirements for code excerpts.
- Emphasizes conservative editing, package manager usage, and recovery strategies when stuck.

### `claude-4-sonnet-tools.json`

- Enumerates Augment toolchain (str-replace-editor, retrieval, diagnostics, process control) with strict parameter schemas and edit-size limits.

### `gpt-5-agent-prompts.txt`

- Mirrors Augment workflows for GPT-5 but shifts to Markdown-plan communication and explicit triggers for starting tasklists after first discovery call.
- Requires efficiency in tool calls, cautious dependency changes, and proactive verification runs.

### `gpt-5-tools.json`

- Supplies GPT-5 oriented tool definitions matching the Claude set with identical guardrails on edits, retrieval, and tasklist maintenance.

## Claude Code

### `claude-code-system-prompt.txt`

- Instructions for Anthropic’s CLI: defensive security scope, TodoWrite planning, tool batching, lint/typecheck enforcement, and no extra commentary in outputs.
- Mandates code references with `file_path:line_number`, forbids unsolicited doc creation, and requires concise responses.

### `claude-code-tools.json`

- Detailed schemas for Task/Bash/Grep/etc., including commit/PR protocols, notebook editing, and todo management rules.

## Cluely

### `Default Prompt.txt`

- Sets Cluely’s strict conversational style: no meta phrases, mandatory per-line code comments, LaTeX math, and specific flows for technical, math, multiple-choice, or UI questions.
- Introduces uncertainty handling mode with prescribed phrasing when intent unclear.

### `Enterprise Prompt.txt`

- Tailors Cluely as a live meeting copilot prioritizing answering last question, defining final-mentioned terms, prompting follow-ups, and objection handling.
- Dictates structured headline + bullet responses, no pronouns, conversation advancement, and passive mode criteria.

## CodeBuddy Prompts

### `Chat Prompt.txt`

- Describes Chat Mode environment metadata, insists on Simplified Chinese replies, and directs conversational responses via `chat_mode_respond`.

### `Craft Prompt.txt`

- Defines Task execution mode: XML tool invocations, per-code-block `path` metadata, Windows CMD nuances, and iterative tool usage with user approval.
- Warns against revealing system prompt and stresses brevity and Chinese responses.

## Comet Assistant

### `System Prompt.txt`

- Guides Perplexity’s browser agent to relentlessly chain tool calls, avoid free-form thoughts, and fetch context before replying.
- Includes browser/email/calendar tool policies, security safeguards, and mandates tool-only outputs until resolution.

## Cursor Prompts

### `Agent Prompt v1.0.txt`

- Claude-powered Cursor agent focusing on parallel tool calls, todo usage, avoiding user-facing code dumps, and code citation formatting.

### `Agent Prompt v1.2.txt`

- GPT-4.1 variant with expanded semantic search expectations, memory citation protocol, and instructions to pursue GitHub PR intel.

### `Agent Prompt 2.0.txt`

- Latest prompt reinforcing parallelism, strict tool adherence, Todo planning, and same file citation rules under Sonnet 4.

### `Agent CLI Prompt 2025-08-07.txt`

- Specifies CLI usage practices, shell command proposals via `run_terminal_cmd`, and consolidated toolset for Cursor’s CLI agent.

### `Agent Prompt 2025-09-03.txt`

- Updated instructions emphasizing minimal narration, parallel reasoning, and alignment with refreshed tool schemas.

### `Agent Tools v1.0.json`

- Tool schema definitions for Cursor agents (search, edit_file, run_terminal_cmd, etc.) with guardrails on path usage and background processes.

### `Chat Prompt.txt`

- Chat-mode persona instructions for interacting without edits, leveraging read-only tools, and deferring implementation to plan stage.

## Devin AI

### `DeepWiki Prompt.txt`

- Frames Devin for documentation-style tasks: thorough investigation, citing sources, and stepwise tool usage.

### `Prompt.txt`

- General Devin agent instructions covering planning, verification, and iterative tool delegation.

## dia

### `Prompt.txt`

- Configures dia assistant persona and workflow (likely condensed instructions for design/product agent).

## Emergent

### `Prompt.txt`

- Defines Emergent agent behavior for software tasks, balancing planning with execution.

### `Tools.json`

- Lists Emergent-specific tool schemas, mirroring edit/read/search capabilities.

## Gemini

### `AI Studio Vibe-Coder.txt`

- Sets Google Gemini coding assistant tone, tool usage expectations, and creative constraints.

## Junie

### `Prompt.txt`

- Outlines Junie agent responsibilities, communication style, and task execution steps.

## Kiro

### `Mode_Clasifier_Prompt.txt`

- Provides prompt for classifying user intent to pick Kiro modes.

### `Spec_Prompt.txt`

- Instructions for generating feature specs with structured sections.

### `Vibe_Prompt.txt`

- Guidance for capturing qualitative feedback or tone from inputs.

## Leap.new

### `Prompts.txt`

- Aggregated instructions for Leap.new agent operations and crafting responses.

### `tools.json`

- Lists available tools and schemas for Leap.new assistant.

## Lovable

### `Agent Prompt.txt`

- Persona and workflow for Lovable coding agent, stressing planning and user alignment.

### `Agent Tools.json`

- Tool definitions supporting Lovable’s edit, search, and diagnostic actions.

## Manus Agent Tools & Prompt

### `Agent loop.txt`

- Describes Manus task loop logic and escalation criteria.

### `Modules.txt`

- Documents modular capabilities or sub-prompts for Manus.

### `Prompt.txt`

- Core Manus agent instructions emphasizing execution discipline.

### `tools.json`

- Tool schemas for Manus agent (edit, search, run commands).

## NotionAi

### `Prompt.txt`

- Instructions guiding Notion AI assistant behavior.

### `tools.json`

- Available tool definitions for Notion AI context.

## Open Source prompts

### Bolt – `Prompt.txt`

- Bolt agent persona/usage guidelines.

### Cline – `Prompt.txt`

- Cline agent instructions and workflow.

### Codex CLI – `openai-codex-cli-system-prompt-20250820.txt` & `Prompt.txt`

- System prompt for Codex CLI and supplementary instructions for interactions.

### Gemini CLI – `google-gemini-cli-system-prompt.txt`

- Gemini CLI environment rules and tool usage.

### Lumo – `Prompt.txt`

- Lumo assistant configuration.

### RooCode – `Prompt.txt`

- RooCode agent guidance for software tasks.

## Orchids.app

### `Decision-making prompt.txt`

- Template for structured decision support.

### `System Prompt.txt`

- Global Orchids assistant instructions.

## Perplexity

### `Prompt.txt`

- Defines Perplexity coding/chat agent conduct and tool expectations.

## Poke

### `Poke agent.txt`

- Overall agent persona for Poke.

### `Poke_p1.txt` – `Poke_p6.txt`

- Progressive prompts covering stages of Poke agent workflow.

## Qoder

### `prompt.txt`

- Qoder agent general instructions.

### `Quest Action.txt`

- Task execution guidelines for quests.

### `Quest Design.txt`

- Framework for designing quest-style tasks.

## Replit

### `Prompt.txt`

- Replit agent instructions for coding assistance.

### `Tools.json`

- Tool schemas tailored to Replit workspace automation.

## Same.dev

### `Prompt.txt`

- Same.dev agent persona and response policies.

### `Tools.json`

- Supported tools for Same.dev operations.

## Trae

### `Builder Prompt.txt`

- Trae builder-mode instructions for constructing solutions.

### `Builder Tools.json`

- Tool definitions for builder mode.

### `Chat Prompt.txt`

- Chat persona for Trae when brainstorming or planning.

## Traycer AI

### `phase_mode_prompts.txt`

- Prompts for phase mode workflows.

### `phase_mode_tools.json`

- Tools available in phase mode.

### `plan_mode_prompts`

- Plan mode instructions (file without extension stores prompt text).

### `plan_mode_tools.json`

- Tool definitions for planning workflow.

## v0 Prompts and Tools

### `Prompt.txt`

- Base prompt for v0 agent behavior.

### `Tools.json`

- Tool schema for v0 assistant.

## VSCode Agent

### `chat-titles.txt`

- Templates for naming chat transcripts.

### `claude-sonnet-4.txt`

- System prompt for Sonnet-backed VSCode agent.

### `gemini-2.5-pro.txt`

- Prompt for Gemini-powered VSCode workflow.

### `gpt-4.1.txt`, `gpt-4o.txt`, `gpt-5-mini.txt`, `gpt-5.txt`

- LLM-specific VSCode agent instructions.

### `nes-tab-completion.txt`

- Prompt for NES tab completion feature.

### `Prompt.txt`

- General VSCode agent behavior overview.

## Warp.dev

### `Prompt.txt`

- Warp terminal assistant persona and command execution guardrails.

## Windsurf

### `Prompt Wave 11.txt`

- Windsurf agent instructions for latest wave.

### `Tools Wave 11.txt`

- Tool definitions aligned with Wave 11 prompt.

## Xcode

### `DocumentAction.txt`, `ExplainAction.txt`, `MessageAction.txt`, `PlaygroundAction.txt`, `PreviewAction.txt`, `System.txt`

- Xcode assistant prompts for various actions (document generation, explanations, messaging, playground support, previews, and global system behavior).

## Z.ai Code

### `prompt.txt`

- Z.ai code assistant guidance.
