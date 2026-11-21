---
name: update-memory-bank
description: Registra en memory-bank/ lo que cambió tras una funcionalidad, decisión o cambio de estructura en el monorepo de HealthCore Digital. Úsala en el paso 5 del flujo de commit de AGENTS.md.
---

# Skill: actualizar el memory bank

## Objetivo

Dejar `memory-bank/progress.md` y, si aplica, `memory-bank/techContext.md` reflejando con exactitud el estado del repo tras un cambio, para que la siguiente sesión (humana o de agente) no tenga que adivinar.

## Inputs

| Input | Obligatorio | Ejemplo |
| --- | --- | --- |
| Resumen del cambio (1–2 frases) | Sí | "Se crea `services/api` con el router `clinics` y 12 clínicas sintéticas" |
| Por qué (necesidad o KPI del briefing) | Sí | "Base de O1: API central; necesaria para la reserva online" |
| Rama | Sí (por defecto, la actual) | `feature/api-clinics` |
| ¿Cambió stack, comando, convención o mapa de carpetas? | Sí (sí/no) | sí: nuevos comandos de `services/api` |
| ¿Se resolvió o abrió una decisión? | No | "Base de datos: PostgreSQL" |

## Pasos

1. Lee `memory-bank/progress.md` y `memory-bank/techContext.md` completos.
2. En `progress.md`:
   - Añade arriba de la **Bitácora** una línea con el formato `- **YYYY-MM-DD · <rama>** · <qué cambió> · <por qué>`.
   - Actualiza la tabla **Estado actual** (⬜ → ⚠️ → ✅) en las filas afectadas.
   - Mueve a **Implementado** lo terminado; quita de **Siguientes pasos** lo completado y añade lo nuevo que haya surgido.
   - Mueve a **Decisiones abiertas** o saca de ella lo que corresponda.
3. En `techContext.md`, solo si el input lo indica:
   - Cambia `[PROPUESTO]`/`[PENDIENTE]` → `[DECIDIDO]` en la fila correspondiente.
   - Sustituye en §6 los comandos propuestos por los reales del proyecto.
   - Añade la ruta nueva al mapa de §3 si se creó una carpeta de proyecto.
4. No edites `projectbrief.md`: si el cambio altera alcance u objetivos, avisa al humano (área protegida).

## Criterios de aceptación

- [ ] `progress.md` tiene exactamente una línea de bitácora nueva, la primera de la sección, con fecha `YYYY-MM-DD` de hoy, la rama, qué cambió y por qué.
- [ ] Toda carpeta de proyecto que exista en disco (`services/api`, `uis/website`, `uis/backoffice`, `agents/appointment-agent`) aparece como ✅ o ⚠️ en **Estado actual**, y ninguna inexistente aparece como ✅.
- [ ] Ningún punto de **Siguientes pasos** describe algo que ya está en **Implementado**.
- [ ] Si el input "¿cambió stack…?" es *sí*, `git diff memory-bank/techContext.md` no está vacío; si es *no*, sí lo está.
- [ ] Cada comando de `techContext.md` §6 marcado como real se ha ejecutado una vez con código de salida 0 en esta sesión.
- [ ] `git diff --name-only` no incluye `memory-bank/projectbrief.md`.
- [ ] Ni el texto añadido ni el diff contienen datos de pacientes (regla `01-patient-data-protection.md`).
