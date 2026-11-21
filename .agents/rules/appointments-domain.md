---
description: Reglas de negocio del ciclo de vida de una cita y del agente de citas. Cárgala cuando la tarea toque citas, disponibilidad, recordatorios, no-shows o agents/appointment-agent.
scope: agent-requested
globs: []
---

# Regla: dominio de citas

**Alcance:** a demanda (*agent-requested*). El agente la carga cuando la tarea menciona citas, reservas, disponibilidad, recordatorios, no-shows o `agents/appointment-agent/`.

## Ciclo de vida (`AppointmentStatus`)

```text
scheduled ──confirm──▶ confirmed ──attend──▶ completed
    │                      │
    ├──reschedule──▶ rescheduled (crea una cita nueva en scheduled y enlaza la anterior)
    ├──cancel──────▶ cancelled
    └──(sin asistencia, 15 min tras la hora)──▶ no_show
```

- Solo se marca `no_show` desde `scheduled`, `confirmed` o `rescheduled`, y nunca antes de la hora de la cita + 15 min.
- Reprogramar no borra la cita original: se marca `rescheduled` y la nueva guarda `rescheduled_from`. Así el KPI de no-shows no pierde historial.
- Toda cita guarda `channel` (`phone`, `front_desk`, `web`, `agent`) para medir la adopción de la reserva online.

## Agente de citas (`agents/appointment-agent/`)

Flujo definido en `company-choice.md`: **solicitud → disponibilidad → agendar → confirmar → recordar → cambios**.

1. Nunca inventa disponibilidad: siempre consulta `GET /v1/availability` antes de ofrecer una franja.
2. Crea la cita solo con la confirmación explícita del paciente (`POST /v1/appointments` con `channel: "agent"`).
3. Recordatorios propuestos: 48 h y 24 h antes, en la zona horaria de la clínica. Los dispara `workflows/` (n8n), no un bucle del agente.
4. Si el paciente pide cambiar o cancelar, el agente usa los endpoints de la API; no edita estados directamente.
5. Ante preguntas clínicas (síntomas, medicación, diagnósticos) responde que no puede asesorar y deriva a la clínica. El agente es administrativo, no clínico.
6. Idioma: responde en el idioma del paciente (`en`, `es`, `en-GB`).
7. Datos que puede ver: los de `01-patient-data-protection.md` §6, nada más.

## Métrica

`no_show_rate = no_show / (completed + no_show)` por sede y semana ISO. Las citas `cancelled` y `rescheduled` quedan fuera del denominador. Línea base del briefing: 22%.
