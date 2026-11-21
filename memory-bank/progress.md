# Progress — HealthCore Digital

> Bitácora viva. Se actualiza en cada commit que cambie comportamiento, estructura o decisiones (ver `AGENTS.md` → flujo previo al commit).
> Formato de entrada: `YYYY-MM-DD · rama · qué cambió · por qué`. Lo más reciente arriba.

## Estado actual (resumen)

| Área | Estado |
| --- | --- |
| Contexto de empresa | ✅ Briefing en `healthcore-BRIEFING.es.md`; elección en `company-choice.md` |
| Infraestructura de agentes | ✅ `memory-bank/`, `AGENTS.md`, `.agents/rules/`, `.agents/skills/` (Hito 4) |
| `CONTEXT.md` | ⚠️ Todavía es el placeholder del template |
| `services/api` | ⬜ No existe |
| `uis/website` | ⬜ No existe |
| `uis/backoffice` | ⬜ No existe |
| `agents/appointment-agent` | ⬜ No existe (idea definida en `company-choice.md`) |
| Datos sintéticos (`data/`) | ⬜ No existen |
| Tooling (ruff, pytest, ESLint, pnpm workspace) | ⬜ Sin configurar; no hay `package.json` ni `pyproject.toml` en la raíz |

## Implementado

- Estructura de carpetas del template (solo READMEs y `.gitkeep`).
- `packages/shared` (`@repo/shared-types`) con los tipos base `Id` y `BaseEntity`, sin tipos de dominio todavía.
- Devcontainer con Python 3.12 + uv, Node 22 + pnpm, Docker.
- Infraestructura de agentes del Hito 4 (ver bitácora).

## En curso

- Hito 4: PR de `feature/agent-memory-bank` → `main`.

## Siguientes pasos (en orden)

1. **Rellenar `CONTEXT.md`** con un resumen operativo de HealthCore (campos, entidades, restricciones) a partir del briefing, usando el agente y sin copiar y pegar.
2. **Tipos de dominio** en `packages/shared/types/index.ts`: `Jurisdiction`, `Clinic`, `Patient`, `Appointment`, `AppointmentStatus` según `techContext.md` §4.
3. **Arrancar `services/api`** (FastAPI + `pyproject.toml` + ruff + pytest) con el router `clinics` y los datos sintéticos de las 12 clínicas. Actualizar `techContext.md` §6 con los comandos reales.
4. **Script de datos sintéticos** en `scripts/` → `data/raw/` (citas con estado `no_show` para calcular la línea base del 22%).
5. Router `appointments` + `availability` y middleware de auditoría.
6. `agents/appointment-agent` desde `agents/_template/`.
7. `uis/website` (home + reserva) y `uis/backoffice` (agenda por sede).

## Decisiones abiertas

- Base de datos y hosting (región UK), ver `techContext.md` §2 y §5.
- Canal de recordatorio inicial: SMS, email o ambos. El briefing pide SMS/email/app; propuesta: empezar por email (sin coste ni proveedor externo).

## Bitácora

- **2026-11-14 · feature/agent-memory-bank** · Se crean `memory-bank/` (projectbrief, techContext, progress), `AGENTS.md`, `CLAUDE.md`, `.agents/rules/` (estructura del monorepo, protección de datos, convenciones de `services/` y `uis/`, dominio de citas) y `.agents/skills/` (`pre-pr-delivery-check`, `update-memory-bank`). · Hito 4: dar a los agentes de código contexto persistente y guardarraíles alineados con HealthCore antes de escribir código de producto.
- **2026-10-28 · main** · Elección de HealthCore, briefing y definición de la idea del agente de citas.
