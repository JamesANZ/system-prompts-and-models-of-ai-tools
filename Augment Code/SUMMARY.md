# Augment Code Summary

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
