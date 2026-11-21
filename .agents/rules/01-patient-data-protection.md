---
description: Protección de datos de pacientes bajo HIPAA (EE.UU.) y UK GDPR (Reino Unido)
scope: always
globs: ["**/*"]
---

# Regla: protección de datos de pacientes

**Alcance:** siempre activa. HealthCore maneja información sanitaria protegida en dos jurisdicciones; un error aquí tiene consecuencias legales para la empresa y para pacientes reales.

## Obligatorio

1. **Solo datos sintéticos.** Todo dato de paciente en fixtures, tests, seeds, notebooks, `data/` o ejemplos de prompt debe ser inventado y llevar un marcador visible: el campo `"synthetic": true` en JSON o una columna `synthetic` en CSV, o el prefijo `SYNTH-` en los IDs.
2. **Jurisdicción explícita**: toda entidad con datos de paciente (`Patient`, `Appointment`) incluye `jurisdiction: "US" | "UK"`. El código que filtra, exporta o retiene datos ramifica por este campo, nunca por el país del servidor.
3. **Auditoría**: todo endpoint de `services/api/` que lea o escriba datos de paciente pasa por el middleware/dependencia de auditoría (actor, acción, `patient_id`, `jurisdiction`, timestamp UTC). Un endpoint nuevo sin auditoría no se commitea.
4. **Mínimo necesario**: los schemas de respuesta (Pydantic) declaran explícitamente los campos devueltos; prohibido devolver el modelo ORM completo o `dict` sin schema.
5. **Logs**: se registran `patient_id` y `appointment_id`, nunca nombre, fecha de nacimiento, teléfono, email, dirección, SSN ni NHS number.
6. **Agente de citas y LLMs**: el prompt solo recibe lo mínimo para agendar (nombre de pila, clínica, franja horaria, preferencia de canal). Prohibido enviar historia clínica, diagnósticos o identificadores nacionales a un LLM.

## Prohibido

- Commitear exports reales de los EHR, de la plataforma de facturación o de la hoja de cálculo de facturación UK.
- Usar SSN o NHS number como clave primaria o en URLs.
- Copiar datos de paciente a `docs/`, issues, PRs o mensajes de commit.
- Desactivar o saltarse la auditoría "temporalmente".

## Si tienes dudas

Detente y pregunta. Las decisiones de retención, residencia de datos o consentimiento son de Compliance (Claire Whitfield) y se registran como [PENDIENTE] en `memory-bank/techContext.md` §5, no se resuelven en código.
