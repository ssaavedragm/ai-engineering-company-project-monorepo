# Tech Context — HealthCore Digital monorepo

> Contexto de negocio: [`projectbrief.md`](./projectbrief.md). Estado actual: [`progress.md`](./progress.md).
> Cada decisión lleva su estado: **[DECIDIDO]** (ya en el repo o acordado), **[PROPUESTO]** (por defecto hasta que alguien lo cambie aquí) o **[PENDIENTE]** (requiere decisión humana).

## 1. Entorno de desarrollo [DECIDIDO]

Definido en [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json):

| Herramienta | Versión / uso |
| --- | --- |
| Python | 3.12, gestionado con **uv** (`uv sync` si existe `pyproject.toml`) |
| Node.js | 22, con **pnpm** activado vía corepack (`pnpm install` si existe `package.json` en la raíz) |
| Docker | docker-outside-of-docker (para `docker-compose.yml` en la raíz) |
| Puertos reenviados | `3000` (frontends Next.js), `8000` (FastAPI), `5678` (n8n) |
| Formato | `editor.formatOnSave: true`; Prettier y ESLint para TS, Pylance para Python |

## 2. Stack

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Backend | **FastAPI** (Python 3.12), una sola app central | [DECIDIDO]: recomendación del template (`README.md` → `services/`) y principio 3 de `projectbrief.md` |
| Frontends | **Next.js** (App Router) + TypeScript | [PROPUESTO]: lo indica el programa para los hitos de UI; no se crea en este hito |
| Tipos compartidos | `@repo/shared-types` en `packages/shared/` | [DECIDIDO]: existe en el repo |
| Automatización | **n8n** (puerto 5678) para recordatorios programados y orquestación | [PROPUESTO] |
| Agentes | Python, a partir de `agents/_template/` | [DECIDIDO]: estructura del template |
| Lint/format Python | `ruff` (`ruff format`, `ruff check`) + `pytest` | [PROPUESTO]: se añade junto con el primer `pyproject.toml` |
| Lint/format TS | ESLint + Prettier + `tsc --noEmit` | [PROPUESTO]: se añade con la primera app de `uis/` |
| Base de datos | PostgreSQL vía `docker-compose.yml` | [PENDIENTE] |
| Hosting / región de datos | — | [PENDIENTE]: lo decide Compliance (ver §5) |
| Workspace runner raíz | — | [PENDIENTE]: hoy no hay `package.json` ni `pyproject.toml` en la raíz |

## 3. Mapa de carpetas del monorepo (dónde va el código)

Este mapa es **obligatorio** para personas y agentes. Se basa en el `README.md` del template y en los README de cada carpeta.

| Ruta | Qué va aquí cuando se cree | HealthCore concreto |
| --- | --- | --- |
| `uis/` | Todos los frontends | — |
| `uis/website/` | Web pública corporativa. Home en `/`; marca y copy salen del briefing | Propuesta de valor (citas en el mismo día, horario ampliado, bilingüe), las 12 clínicas, **flujo público de reserva online**. Idiomas: `en` y `es` (EE.UU.), `en-GB` (Reino Unido). **Sin datos de paciente fuera del flujo de reserva.** |
| `uis/backoffice/` | App interna con **layout propio**; vista de entrada en `/` | Agenda por sede para recepción, vista de historia unificada para clínicos y dashboard de citas/no-shows por sede |
| `services/` | APIs y servicios backend | — |
| `services/api/` | **La** API central FastAPI con routers por dominio | Routers: `clinics`, `patients`, `appointments`, `availability`. Adaptadores EHR en `services/api/app/integrations/ehr_us/` y `ehr_uk/`. Middleware de auditoría de acceso a datos de pacientes. |
| `services/<worker>/` | Solo si un proceso no puede vivir dentro de la API | p. ej. `services/reminder-worker/`, únicamente si n8n no basta |
| `agents/appointment-agent/` | El agente de IA del proyecto (copia de `agents/_template/`) | Recibe solicitud → consulta `availability` → agenda → confirma → recuerda → gestiona cambios |
| `workflows/` | Exports de n8n | Disparadores de recordatorios (p. ej. 48 h y 24 h antes de la cita) |
| `data/raw/` → `data/pipelines/` → `data/process/` | Flujo de datos | **Solo datos sintéticos** de citas y pacientes para calcular el KPI de no-shows |
| `data/eval/` | Evaluación | Conversaciones de reserva de prueba para evaluar el agente |
| `packages/shared/` | Tipos usados por `uis/` **y** `services/` | `Clinic`, `Patient`, `Appointment`, `Jurisdiction`, `AppointmentStatus` |
| `shared/` | Esquemas y plantillas no-código | Spec OpenAPI exportada, plantillas de SMS/email de recordatorio |
| `docs/` | Arquitectura y ADRs | ADRs de cumplimiento (HIPAA / UK GDPR) |
| `infra/` | Dockerfiles, CI, deploy | — |
| `memory-bank/` | Contexto persistente para agentes de código | Este archivo y sus hermanos |
| `.agents/rules/`, `.agents/skills/` | Reglas y skills para los **agentes de código que trabajan en este repo** | Distinto de `skills/` (ver abajo) |

**Carpetas prohibidas** (no crear árboles paralelos): `apps/`, `frontend/`, `backend/`, `api/` en la raíz, `src/` en la raíz, `web/`, `server/`, ni un segundo FastAPI fuera de `services/api/`.

**`skills/` vs `.agents/skills/`:** `skills/` (raíz, del template) guarda capacidades que usan los **agentes del producto** (p. ej. `agents/appointment-agent`). `.agents/skills/` guarda procedimientos para el **agente de código** que edita este repo (checklist de PR, actualizar el memory bank).

## 4. Convenciones de dominio [PROPUESTO]

Código, identificadores, rutas de API y nombres de campos en **inglés**; documentación y memory bank en **español**; README en ambos idiomas (`README.md` + `README.es.md`), como hace el template.

| Concepto | Convención |
| --- | --- |
| Jurisdicción | `Jurisdiction = "US" \| "UK"`, campo obligatorio en `Clinic`, `Patient` y `Appointment` |
| ID de clínica | `{país}-{región}-{nn}`: `us-tx-01`, `us-fl-01`, `us-ga-01`, `uk-lon-01`, `uk-man-01` |
| ID de paciente | `patient_id` propio de HealthCore (UUID) + `source_ehr` (`ehr_us` \| `ehr_uk`) + `source_record_id`. Nunca se expone SSN ni NHS number como ID. |
| Estado de cita | `AppointmentStatus = scheduled \| confirmed \| rescheduled \| cancelled \| completed \| no_show` |
| Canal de reserva | `channel = phone \| front_desk \| web \| agent` (para medir la adopción online) |
| Fechas | Se guardan en **UTC** (ISO 8601); se muestran en la zona de la clínica: `America/Chicago` (TX), `America/New_York` (FL, GA; ojo con el Panhandle de Florida, que va en Central), `Europe/London` (UK) |
| Rutas de API | Plural, kebab-case, versionadas: `/v1/clinics`, `/v1/patients/{patient_id}`, `/v1/appointments` |

## 5. Restricciones técnicas y de cumplimiento

1. **Cero PHI/PII real en el repositorio.** Nada de nombres reales, fechas de nacimiento, SSN, NHS numbers, teléfonos o emails de pacientes en código, fixtures, logs, prompts o `data/`. Datos sintéticos generados con un script en `scripts/` y marcados como tales.
2. **Auditoría obligatoria**: todo endpoint que lea o escriba datos de paciente registra quién, qué, cuándo y la jurisdicción (requisito de Claire Whitfield: hoy las pistas de auditoría están incompletas).
3. **Mínimo necesario (HIPAA) / minimización (UK GDPR)**: las respuestas de la API solo devuelven los campos que la vista necesita.
4. **Solicitudes de acceso del paciente** (GDPR DSAR / HIPAA right of access): el modelo de datos debe permitir compilar todo lo de un `patient_id` desde ambos EHR. Diseñar pensando en ello aunque no se implemente aún.
5. **Residencia de datos UK**: [PENDIENTE]. Hipótesis de trabajo: los datos de pacientes UK no salen de la región UK. Confirmar con Compliance antes de elegir hosting.
6. **Secretos** solo en `.env` (ignorado por git); se documentan en `.env.example` sin valores.
7. **LLMs y datos de paciente**: el agente de citas solo recibe los datos mínimos para agendar (nombre de pila, clínica, franja, canal de contacto). Nunca historia clínica.
8. **Sin integración real con EHR** en el alcance del curso: los adaptadores `ehr_us` / `ehr_uk` empiezan como mocks con la misma interfaz.

## 6. Comandos (se rellenan al crear cada proyecto)

| Proyecto | Instalar | Lint/format | Tests/typecheck | Ejecutar |
| --- | --- | --- | --- | --- |
| `services/api` | `uv sync` | `uv run ruff format --check . && uv run ruff check .` | `uv run pytest` | `uv run fastapi dev app/main.py` (puerto 8000) |
| `uis/website`, `uis/backoffice` | `pnpm install` | `pnpm lint` | `pnpm typecheck` | `pnpm dev` (puerto 3000) |
| `agents/appointment-agent` | `uv sync` | `uv run ruff check .` | `uv run pytest tests/` | — |

Mientras un proyecto no exista, su fila es **[PROPUESTO]**; al crearlo, actualiza la fila con los comandos reales.
