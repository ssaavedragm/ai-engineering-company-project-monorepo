# Progress — HealthCore Digital

> Bitácora viva. Se actualiza en cada commit que cambie comportamiento, estructura o decisiones (ver `AGENTS.md` → flujo previo al commit).
> Formato de entrada: `YYYY-MM-DD · rama · qué cambió · por qué`. Lo más reciente arriba.

## Estado actual (resumen)

| Área | Estado |
| --- | --- |
| Contexto de empresa | ✅ Briefing en `healthcore-BRIEFING.es.md`; elección en `company-choice.md` |
| Infraestructura de agentes | ✅ `memory-bank/`, `AGENTS.md`, `.agents/rules/`, `.agents/skills/` (Hito 4) |
| `CONTEXT.md` | ✅ Resumen operativo de HealthCore en `CONTEXT.md` / `CONTEXT.es.md` |
| `services/api` | ⬜ No existe |
| `uis/website` | 🟡 Hito 1 implementado en `feature/website-fundamentals`: landing y formulario de consulta EN/ES, estático + Tailwind; PR pendiente |
| `uis/backoffice` | ⬜ No existe |
| `agents/appointment-agent` | ⬜ No existe (idea definida en `company-choice.md`) |
| Datos sintéticos (`data/`) | ⬜ No existen |
| Tooling (ruff, pytest, ESLint, pnpm workspace) | ⬜ Sin configurar; no hay `package.json` ni `pyproject.toml` en la raíz |

## Implementado

- Estructura de carpetas del template (solo READMEs y `.gitkeep`).
- `packages/shared` (`@repo/shared-types`) con los tipos base `Id` y `BaseEntity`, sin tipos de dominio todavía.
- Devcontainer con Python 3.12 + uv, Node 22 + pnpm, Docker.
- Infraestructura de agentes del Hito 4 (ver bitácora).
- `uis/website`: landing (`index.html`, `index.es.html`) y formulario de consulta (`application.html`, `application.es.html`) con validación en `validators.js` + `validation.js` y 21 tests (`node --test`). Lighthouse en local: rendimiento 97–98, accesibilidad, buenas prácticas y SEO 100. Auditado con `seo-check` (todos los checks ✅) y `accessibility-check` (axe-core WCAG 2.2 AA en los estados inicial, errores, campos condicionales y éxito, más teclado y reflow: 74/74).

## En curso

- Hito 1 (fundamentos web): PR de `feature/website-fundamentals` → `main`. Falta exponer el puerto 3000 como público en Codespaces y adjuntar la URL y la captura de PageSpeed/Lighthouse (≥ 80) al PR.

## Siguientes pasos (en orden)

1. ~~**Rellenar `CONTEXT.md`**~~ ✅ Hecho en `feature/website-fundamentals` (ver bitácora).
2. **Tipos de dominio** en `packages/shared/types/index.ts`: `Jurisdiction`, `Clinic`, `Patient`, `Appointment`, `AppointmentStatus` según `techContext.md` §4.
3. **Arrancar `services/api`** (FastAPI + `pyproject.toml` + ruff + pytest) con el router `clinics` y los datos sintéticos de las 12 clínicas. Actualizar `techContext.md` §6 con los comandos reales.
4. **Script de datos sintéticos** en `scripts/` → `data/raw/` (citas con estado `no_show` para calcular la línea base del 22%).
5. Router `appointments` + `availability` y middleware de auditoría.
6. `agents/appointment-agent` desde `agents/_template/`.
7. `uis/website`: migrar a Next.js y convertir el formulario de consulta en el flujo de reserva contra la API. `uis/backoffice`: agenda por sede.

## Decisiones abiertas

- Base de datos y hosting (región UK), ver `techContext.md` §2 y §5.
- Canal de recordatorio inicial: SMS, email o ambos. El briefing pide SMS/email/app; propuesta: empezar por email (sin coste ni proveedor externo).

## Bitácora

- **2026-11-26 · feature/website-fundamentals** · Se sustituye el placeholder de `CONTEXT.md` / `CONTEXT.es.md` por el contexto operativo de HealthCore: alcance, personas, enumeraciones, entidades, las 6 clínicas de EE. UU. con `clinic_id` propuesto (`us-tx-01`…`us-ga-01`) y zona horaria, KPIs y restricciones. Las 3 clínicas restantes de EE. UU. y las 3 de Reino Unido quedan [PENDIENTE] porque ningún briefing las nombra. Editado con confirmación explícita del estudiante (área protegida). · Que todo el trabajo y los agentes usen los mismos datos de dominio, nombres de campos y restricciones.
- **2026-11-20 · feature/website-fundamentals** · Se añaden las skills `seo-check` y `accessibility-check` (WCAG 2.2 AA) en `.agents/skills/`, y `.claude/skills/` con enlaces simbólicos a las 4 skills para que Claude Code las cargue (autorizado por el estudiante). · Seguir de forma reproducible los criterios de SEO y accesibilidad que evalúa el Hito 1 y los siguientes hitos de UI.
- **2026-11-20 · feature/website-fundamentals** · Se crea `uis/website` con HTML estático + Tailwind (Play CDN con versión fija): landing y formulario de consulta para pacientes en inglés y español, Schema.org `MedicalOrganization` + 6 `MedicalClinic`, validación en tiempo real de las 10 reglas del briefing del hito (`uis/website/BRIEFING.md`) y tests con `node --test`. Se añade una excepción del Hito 1 a `.agents/rules/uis-frontends.md` (autorizada por el estudiante). · Hito 1: primera presencia web de HealthCore y captura estructurada de consultas para recepción.
- **2026-11-14 · feature/agent-memory-bank** · Se crean `memory-bank/` (projectbrief, techContext, progress), `AGENTS.md`, `CLAUDE.md`, `.agents/rules/` (estructura del monorepo, protección de datos, convenciones de `services/` y `uis/`, dominio de citas) y `.agents/skills/` (`pre-pr-delivery-check`, `update-memory-bank`). · Hito 4: dar a los agentes de código contexto persistente y guardarraíles alineados con HealthCore antes de escribir código de producto.
- **2026-10-28 · main** · Elección de HealthCore, briefing y definición de la idea del agente de citas.
