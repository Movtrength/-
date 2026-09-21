# Install JevHarness in Cursor

This plugin teaches a Cursor agent how to use JevHarness. Installing it does not install Python dependencies, configure model keys, grant tool permissions, or make a private repository publicly accessible.

The Python runtime stays in a JevHarness checkout (`auto_jev/`, `pyproject.toml`). A copy of this plugin is not that checkout. Verify the checkout contains those paths before importing `auto_jev`.

Upstream also ships a Claude Code plugin and a Codex skill. Those hosts use `.claude-plugin/` and `scripts/install-skill.py`. In Cursor, use this plugin instead of `/plugin marketplace add` or `$skill-installer`.

## Local plugin install

From a checkout of this plugin directory (the folder that contains `.cursor-plugin/`):

```bash
plugins/jev-harness/scripts/install-cursor.sh
```

The script links the plugin to `~/.cursor/plugins/local/jev-harness`. Override the parent directory with `CURSOR_PLUGIN_DIR` if needed. It refuses to replace an existing path. Start a new Cursor chat after linking so discovery reloads.

To install without the script:

```bash
mkdir -p ~/.cursor/plugins/local
ln -s "$(pwd)/plugins/jev-harness" ~/.cursor/plugins/local/jev-harness
```

If this repository is not the plugin source, link the directory that contains `.cursor-plugin/plugin.json`.

## What Cursor loads

| Cursor path | Role | Invocation |
| --- | --- | --- |
| `skills/jev-harness/` | Task contract and stage order | Describe the task, or `/jev-harness` |
| `skills/jev-pipeline/` | First graph and adapter | After the contract, or when editing a pipeline |
| `skills/jev-evolution/` | Optional GEPA reflection | `/jev-evolve` when search is requested |
| `skills/jev-freeze/` | Freeze and hand-over | `/jev-freeze` after validation selection |
| `agents/jev-harness-author.md` | End-to-end authoring agent | Delegate a full harness task |
| `rules/*.mdc` | Candidate and provider boundaries | Requestable while harness work is in scope |
| `commands/*.md` | Slash-command entry points | `/jev-harness`, `/jev-evolve`, `/jev-freeze` |

There is no hook and no MCP server. Upstream omitted them on purpose, and this packaging keeps that boundary.

## First use

```text
/jev-harness Route support tickets into our queues.
Start by clarifying outcomes, inputs, available examples, and evaluation.
Do not run paid inference or write to the ticket system yet.
```

Supply desired outcomes and examples. The agent should state the task contract before implementing a new adapter. If no defensible evaluator is available, begin with a prototype and an evaluation plan.

## Runtime

Python 3.11 or newer. Functional Python nodes currently require a supported macOS native sandbox. Unavailable isolation fails closed. Version 2 expression and Jev flows do not launch those workers.

| Purpose | Configuration |
| --- | --- |
| Jev through Vercel AI Gateway | `JevClient(transport="vercel")` and `AI_GATEWAY_API_KEY` |
| Jev through TypeSafe directly | `JevClient(transport="typesafe")` and `TYPESAFE_API_KEY` |
| Optional reflection | `make_proposer` for Claude CLI, OpenAI, Azure, or Anthropic |
| Reading an archived run | No model credentials |

Keep credentials in environment variables or a local ignored env file. Never place them in task observations or artifacts.
