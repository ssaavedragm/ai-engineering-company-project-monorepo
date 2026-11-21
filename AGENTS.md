# AGENTS.md — Protocolo para agentes de código

Este repositorio es el monorepo de **HealthCore Digital**: red de 12 clínicas ambulatorias en EE.UU. y Reino Unido, con datos de pacientes regulados por **HIPAA** y **UK GDPR**. Cualquier agente de IA (Claude Code, Cursor, Copilot, Codex…) que edite este repo debe seguir este protocolo.

---

## 1. Inicio de sesión: lecturas obligatorias

Antes de proponer o hacer **cualquier** edición, lee en este orden:

1. [`memory-bank/projectbrief.md`](./memory-bank/projectbrief.md): negocio, alcance, objetivos y KPIs.
2. [`memory-bank/techContext.md`](./memory-bank/techContext.md): stack, mapa de carpetas, convenciones de dominio y restricciones de cumplimiento.
3. [`memory-bank/progress.md`](./memory-bank/progress.md): qué existe hoy, qué está en curso y cuál es el siguiente paso.
4. Las reglas de [`.agents/rules/`](./.agents/rules/) cuyo alcance aplique (las `always` siempre; las de ruta según los archivos que vayas a tocar).
5. El `README.md` de la carpeta en la que vas a trabajar.

Si la tarea contradice el memory bank (por ejemplo, crear algo fuera del mapa de carpetas o tocar un área fuera de alcance), **para y pregunta** antes de editar.

Fuente de verdad del negocio: [`healthcore-BRIEFING.es.md`](./healthcore-BRIEFING.es.md).

## 2. Reglas de oro

- **Ningún dato real de paciente**: nada de PHI/PII en código, tests, fixtures, logs, prompts ni `data/`. Solo datos sintéticos. Ver [`.agents/rules/01-patient-data-protection.md`](./.agents/rules/01-patient-data-protection.md).
- **Respeta el mapa de carpetas**: `uis/website`, `uis/backoffice`, `services/api`. No crees árboles paralelos (`apps/`, `frontend/`, `backend/`, `src/` en la raíz…). Ver [`.agents/rules/00-monorepo-structure.md`](./.agents/rules/00-monorepo-structure.md).
- **Una sola API central** en `services/api/`. No crees microservicios nuevos sin confirmación.
- **Alcance pequeño**: un cambio por commit; no refactorices lo que la tarea no pide.

## 3. Flujo obligatorio antes de cada commit

Ejecuta **todos** los pasos, en este orden. Si uno falla, corrige y vuelve a empezar desde el paso 1.

1. **Revisa el alcance**: ejecuta `git status` y `git diff --stat`. Confirma que solo cambian archivos relacionados con la tarea y que **ninguno** está en las áreas protegidas (§4). Si aparece uno, deshaz ese cambio o pide confirmación.
2. **Formatea y pasa el linter** en cada proyecto tocado, con los comandos de `memory-bank/techContext.md` §6 (p. ej. `uv run ruff format . && uv run ruff check .` en `services/api`; `pnpm lint` en `uis/*`). Si el proyecto aún no tiene linter, escribe `lint: n/a (sin configurar)` en el cuerpo del commit.
3. **Ejecuta tests y typecheck** de cada proyecto tocado (`uv run pytest`, `pnpm typecheck`). Cero fallos. Si añadiste comportamiento nuevo, añade al menos un test que lo cubra.
4. **Busca datos sensibles en el diff**: ejecuta `git diff --cached | grep -nEi '([0-9]{3}-[0-9]{2}-[0-9]{4}|[0-9]{3} ?[0-9]{3} ?[0-9]{4}|nhs[_ -]?number|ssn|api[_-]?key|secret|password|@[a-z0-9-]+\.(com|org|co\.uk|nhs\.uk))'` y revisa cada coincidencia. Ningún SSN, NHS number, teléfono, email de paciente ni secreto puede llegar al commit.
5. **Actualiza el memory bank**: si cambió comportamiento, estructura o una decisión, añade una entrada a `memory-bank/progress.md` (bitácora y tabla de estado) y actualiza `memory-bank/techContext.md` si cambió el stack, un comando o una convención. Puedes usar la skill [`update-memory-bank`](./.agents/skills/update-memory-bank/SKILL.md).
6. **Sincroniza la documentación bilingüe**: si editaste un `README.md`, aplica el mismo cambio en su `README.es.md` (y viceversa).
7. **Commitea con Conventional Commits**: `tipo(ámbito): descripción` (p. ej. `feat(api): add appointments router`, `docs(memory-bank): log milestone 4`). Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Antes de abrir un PR, ejecuta la skill [`pre-pr-delivery-check`](./.agents/skills/pre-pr-delivery-check/SKILL.md).

## 4. Áreas protegidas: no modificar sin confirmación humana explícita

Pregunta y espera un "sí" explícito antes de crear, editar, mover o borrar:

| Ruta | Motivo |
| --- | --- |
| `healthcore-BRIEFING.es.md`, `company-choice.md` | Fuente de verdad del negocio y decisiones del estudiante |
| `AGENTS.md`, `CLAUDE.md`, `.agents/**` | El propio protocolo de los agentes |
| `memory-bank/projectbrief.md` | Cambiar alcance u objetivos es decisión de negocio (`progress.md` y `techContext.md` sí se actualizan en el flujo normal) |
| `.devcontainer/**` | Entorno compartido de todo el equipo |
| `infra/**`, `.github/**`, `docker-compose.yml` | CI/CD, despliegue y orquestación |
| `packages/shared/**` | Contrato de tipos entre `uis/` y `services/`; un cambio puede romper ambos lados |
| `pnpm-lock.yaml`, `uv.lock`, `package-lock.json` | Lockfiles: solo cambian vía `pnpm install` / `uv sync` cuando la tarea lo exige |
| `.env`, `.env.*` (excepto `.env.example`) | Secretos. Nunca se leen en voz alta ni se commitean |
| `data/raw/**` | Datos fuente; solo se añaden datasets sintéticos documentados |
| `agents/_template/**`, `skills/_template/**` | Plantillas base del template |
| `README.md`, `README.es.md`, `CONTEXT.md`, `CONTEXT.es.md` (raíz) | Documentación del template y contexto global |

## 5. Dónde va cada cosa (resumen)

| Necesito… | Ruta |
| --- | --- |
| Web pública / reserva online | `uis/website/` |
| Herramienta interna (agenda, dashboards) | `uis/backoffice/` |
| Endpoint de API | router nuevo en `services/api/` |
| Agente de citas | `agents/appointment-agent/` |
| Recordatorios programados | `workflows/` |
| Tipos compartidos UI↔API | `packages/shared/` (área protegida) |
| Datos sintéticos | `scripts/` (generador) → `data/raw/` |
| Decisión de arquitectura | `docs/` (ADR) + `memory-bank/techContext.md` |

El mapa completo está en `memory-bank/techContext.md` §3.
