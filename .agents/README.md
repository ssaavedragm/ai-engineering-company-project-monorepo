# `.agents/`

Rules and skills for the **coding agents** that work in this repository. The overall protocol lives in [`../AGENTS.md`](../AGENTS.md).

## Rules (`rules/`)

| File | Scope | Summary |
| --- | --- | --- |
| [`00-monorepo-structure.md`](./rules/00-monorepo-structure.md) | `always` | Where each project lives (`uis/website`, `uis/backoffice`, `services/api`…) and which folders are forbidden |
| [`01-patient-data-protection.md`](./rules/01-patient-data-protection.md) | `always` | HIPAA / UK GDPR: synthetic data, jurisdiction, auditing, logs, LLMs |
| [`services-api.md`](./rules/services-api.md) | `path`: `services/**` | Structure and conventions for the FastAPI API |
| [`uis-frontends.md`](./rules/uis-frontends.md) | `path`: `uis/**` | Next.js conventions for the website and the backoffice |
| [`appointments-domain.md`](./rules/appointments-domain.md) | `agent-requested` | Appointment lifecycle, the appointment agent, and how the no-show rate is calculated |

Scopes: `always` = loaded in every session; `path` = loaded when files matching `globs` are touched; `agent-requested` = the agent loads it when the task matches its `description`.

## Skills (`skills/`)

| Skill | Objective |
| --- | --- |
| [`pre-pr-delivery-check`](./skills/pre-pr-delivery-check/SKILL.md) | Verify that a branch is ready to open a PR against `main` |
| [`update-memory-bank`](./skills/update-memory-bank/SKILL.md) | Record in `memory-bank/` what changed after a piece of work |
| [`seo-check`](./skills/seo-check/SKILL.md) | Audit and fix technical SEO of `uis/website`: metadata, EN/ES hreflang, Schema.org, Lighthouse/PageSpeed ≥ 80 |
| [`accessibility-check`](./skills/accessibility-check/SKILL.md) | Audit and fix accessibility (WCAG 2.2 AA) in `uis/`: semantics, keyboard, forms, contrast, EN/ES |

Claude Code loads these skills from [`../.claude/skills/`](../.claude/skills/), which contains symlinks to this folder (single source of truth). Other agents read them through `AGENTS.md`.

> Not to be confused with [`../skills/`](../skills/README.md), which holds skills for the **product's** agents (e.g. `agents/appointment-agent`).

> _Rules and skills are written in Spanish; a Spanish version of this file is available in [README.es.md](./README.es.md)._
