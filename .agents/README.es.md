# `.agents/`

Reglas y skills para los **agentes de código** que trabajan en este repositorio. El protocolo general está en [`../AGENTS.md`](../AGENTS.md).

## Reglas (`rules/`)

| Archivo | Alcance | Resumen |
| --- | --- | --- |
| [`00-monorepo-structure.md`](./rules/00-monorepo-structure.md) | `always` | Dónde va cada proyecto (`uis/website`, `uis/backoffice`, `services/api`…) y qué carpetas están prohibidas |
| [`01-patient-data-protection.md`](./rules/01-patient-data-protection.md) | `always` | HIPAA / UK GDPR: datos sintéticos, jurisdicción, auditoría, logs, LLMs |
| [`services-api.md`](./rules/services-api.md) | `path`: `services/**` | Estructura y convenciones de la API FastAPI |
| [`uis-frontends.md`](./rules/uis-frontends.md) | `path`: `uis/**` | Convenciones de Next.js para website y backoffice |
| [`appointments-domain.md`](./rules/appointments-domain.md) | `agent-requested` | Ciclo de vida de una cita, agente de citas y cálculo de no-shows |

Alcances: `always` = se carga en cada sesión; `path` = se carga cuando se tocan archivos que coinciden con `globs`; `agent-requested` = el agente la carga cuando la tarea encaja con su `description`.

## Skills (`skills/`)

| Skill | Objetivo |
| --- | --- |
| [`pre-pr-delivery-check`](./skills/pre-pr-delivery-check/SKILL.md) | Verificar que una rama está lista para abrir un PR contra `main` |
| [`update-memory-bank`](./skills/update-memory-bank/SKILL.md) | Registrar en `memory-bank/` lo que cambió tras un trabajo |
| [`seo-check`](./skills/seo-check/SKILL.md) | Auditar y corregir el SEO técnico de `uis/website`: metadatos, hreflang EN/ES, Schema.org, Lighthouse/PageSpeed ≥ 80 |
| [`accessibility-check`](./skills/accessibility-check/SKILL.md) | Auditar y corregir la accesibilidad (WCAG 2.2 AA) en `uis/`: semántica, teclado, formularios, contraste, EN/ES |

Claude Code carga estas skills desde [`../.claude/skills/`](../.claude/skills/), que contiene enlaces simbólicos a esta carpeta (una sola fuente de verdad). Los demás agentes las leen a través de `AGENTS.md`.

> No confundir con [`../skills/`](../skills/README.es.md), que guarda skills para los agentes del **producto** (p. ej. `agents/appointment-agent`).

> _English version: [README.md](./README.md)._
