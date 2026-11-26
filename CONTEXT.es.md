# Contexto del proyecto — HealthCore Digital

> _También disponible en [inglés](./CONTEXT.md)._

Resumen operativo para personas y agentes de IA que trabajan en este monorepo: qué empresa es, qué construimos, con qué datos de dominio y bajo qué restricciones. Fuentes de verdad: [`healthcore-BRIEFING.es.md`](./healthcore-BRIEFING.es.md) (empresa) y [`company-choice.md`](./company-choice.md) (alcance elegido). El detalle técnico vive en [`memory-bank/`](./memory-bank/); el protocolo de los agentes de código, en [`AGENTS.md`](./AGENTS.md).

Etiquetas: **[DECIDIDO]** sale de una fuente o ya está en el repo · **[PROPUESTO]** valor por defecto hasta que alguien lo cambie · **[PENDIENTE]** falta un dato o una decisión humana.

## 1. La empresa en una línea

HealthCore es una red sanitaria ambulatoria (fundada en 2011, sede en Austin, Texas) con **12 clínicas**: 9 en EE. UU. (Texas, Florida, Georgia) y 3 en Reino Unido (Londres, Mánchester). Ofrece atención primaria, especialistas, crónicos y prevención. Tiene ~200 personas y factura ~28 M USD/año. Su propuesta de valor es el acceso: citas en el mismo día, horario ampliado y personal bilingüe inglés/español en EE. UU.

**HealthCore Digital** es la unidad interna que construye los sistemas. Este repo es su monorepo.

## 2. El problema que atacamos

| Síntoma (briefing) | Dato |
| --- | --- |
| Dos EHR (EE. UU. y Reino Unido) que no se comunican | La historia del paciente no le sigue entre sedes ni países |
| Reservas solo por teléfono (EE. UU.) o llamando a recepción con agenda manual (Reino Unido) | 0 % de reservas online |
| No-shows sin contacto proactivo | **22 %** de la red, ~**1,8 M USD/año** en huecos perdidos |
| Sin capa de datos, telemetría ni logs centralizados | Los fallos se descubren cuando llama una clínica |
| Pistas de auditoría incompletas | Las solicitudes de acceso a datos (GDPR/HIPAA) se compilan a mano |

## 3. Alcance de este proyecto [DECIDIDO]

Tres departamentos foco (ver `company-choice.md`):

1. **Operaciones Clínicas**: datos de paciente unificados y consultables desde cualquier sede de ambos países.
2. **Experiencia del Paciente y Acceso**: centralizar la solicitud de citas y su seguimiento.
3. **Tecnología**: la API central que resuelve (1) y (2) y deja la base para el resto.

**Agente de IA del producto:** un agente de citas que recibe la solicitud, consulta la disponibilidad, agenda, confirma, envía recordatorios y gestiona cambios.

**Fuera de alcance** (solo contexto): facturación y rechazo de reclamaciones (14 %), RR. HH. y CME, documentación clínica asistida por IA, dashboard ejecutivo completo.

## 4. Personas clave

| Persona | Rol | Qué espera de nosotros |
| --- | --- | --- |
| Dra. Sandra Okonkwo | CEO | Saber la tasa de no-shows de la semana sin llamar a nadie. Rechaza la tecnología que no resuelve un problema real. |
| Dr. Marcus Reid | Director de Operaciones Clínicas | Historia del paciente unificada entre sedes y países. |
| Priya Nair | Experiencia del Paciente y Acceso (Londres) | Reserva online en ambos mercados y menos no-shows. |
| James Osei | CTO (6 personas, Austin) | Una sola API central en lugar del mosaico actual. |
| Claire Whitfield | Cumplimiento y Gobierno del Dato | Todo sistema con datos de paciente pasa por HIPAA **y** UK GDPR. Tiene veto de facto. |

## 5. Usuarios del producto

- **Paciente**: EE. UU. en inglés o español; Reino Unido en inglés británico. Reserva, confirma, cambia o cancela citas.
- **Recepción**: gestiona la agenda de su sede.
- **Clínico**: consulta la historia unificada del paciente.
- **Dirección**: consulta los KPIs de citas por sede.

## 6. Datos de dominio

Código, identificadores y campos en **inglés**; documentación en español. Las convenciones completas están en [`memory-bank/techContext.md`](./memory-bank/techContext.md) §4.

### 6.1 Enumeraciones

| Tipo | Valores | Estado |
| --- | --- | --- |
| `Jurisdiction` | `US` \| `UK` | [DECIDIDO] |
| `AppointmentStatus` | `scheduled` \| `confirmed` \| `rescheduled` \| `cancelled` \| `completed` \| `no_show` | [PROPUESTO] |
| `channel` | `phone` \| `front_desk` \| `web` \| `agent` | [PROPUESTO] |
| `source_ehr` | `ehr_us` \| `ehr_uk` | [PROPUESTO] |
| `service_type` | `Primary Care` · `Chronic Disease Management` · `Specialist Consultation` · `Preventive Health` · `Women's Health` · `Paediatric Care` · `Mental Health` | [DECIDIDO] (briefing del Hito 1) |
| `preferred_time` | `Morning (7am–12pm)` · `Afternoon (12pm–5pm)` · `Evening (5pm–8pm)` | [DECIDIDO] (briefing del Hito 1) |

### 6.2 Entidades

| Entidad | Campos clave | Reglas |
| --- | --- | --- |
| `Clinic` | `clinic_id`, `name`, `city`, `region`, `jurisdiction`, `timezone`, `opening_hours` | `clinic_id` = `{país}-{región}-{nn}` |
| `Patient` | `patient_id` (UUID de HealthCore), `jurisdiction`, `source_ehr`, `source_record_id` | Nunca se usa SSN ni NHS number como ID ni se expone |
| `Appointment` | `appointment_id`, `patient_id`, `clinic_id`, `jurisdiction`, `service_type`, `start_at` (UTC), `status`, `channel` | `no_show` alimenta el KPI principal; `channel` mide la adopción online |
| Consulta web (Hito 1) | Los campos del formulario de [`uis/website/BRIEFING.md`](./uis/website/BRIEFING.md) | Hoy el envío es simulado; mañana se convertirá en una `Appointment` con `channel = web` |

Fechas: se guardan en **UTC** (ISO 8601) y se muestran en la zona de la clínica.

### 6.3 Clínicas

| `clinic_id` [PROPUESTO] | Nombre | Ciudad | Zona horaria | Horario |
| --- | --- | --- | --- | --- |
| `us-tx-01` | HealthCore Austin Central | Austin, TX | `America/Chicago` | Lun–Vie 7am–8pm · Sáb 9am–3pm |
| `us-tx-02` | HealthCore Austin North | Austin, TX | `America/Chicago` | Lun–Vie 8am–7pm |
| `us-tx-03` | HealthCore San Antonio | San Antonio, TX | `America/Chicago` | Lun–Vie 8am–6pm · Sáb 9am–1pm |
| `us-fl-01` | HealthCore Miami | Miami, FL | `America/New_York` | Lun–Vie 7am–8pm · Sáb 9am–4pm |
| `us-fl-02` | HealthCore Orlando | Orlando, FL | `America/New_York` | Lun–Vie 8am–6pm |
| `us-ga-01` | HealthCore Atlanta | Atlanta, GA | `America/New_York` | Lun–Vie 8am–7pm |

Los teléfonos de las clínicas están en el briefing del Hito 1. **[PENDIENTE]**: los briefings no dan nombre ni horario de las otras 3 clínicas de EE. UU. ni de las 3 de Reino Unido (Londres, Mánchester; zona `Europe/London`). Hasta que haya un dato oficial, los datos sintéticos las tratan como clínicas marcadas como tales y no se muestran en la web pública.

## 7. KPIs

| KPI | Línea base | Qué lo mueve o lo mide |
| --- | --- | --- |
| Tasa de no-shows en la red | 22 % | `Appointment.status = no_show` por sede y semana; recordatorios del agente de citas |
| Coste de huecos perdidos | ~1,8 M USD/año | Se deriva de los no-shows por sede |
| Reservas online | 0 % | Proporción de citas con `channel = web` o `agent` |
| Historia del paciente entre sedes | No existe | Un único `patient_id` consultable desde cualquier sede |

## 8. Restricciones no negociables

1. **Cero datos reales de paciente** en el repo: código, tests, fixtures, logs, prompts y `data/` usan solo datos sintéticos.
2. **HIPAA (EE. UU.) y UK GDPR (Reino Unido)**: toda entidad lleva su `jurisdiction` y todo acceso a datos de paciente queda auditado (quién, qué, cuándo, jurisdicción).
3. **Mínimo necesario**: cada respuesta devuelve solo los campos que necesita la vista. El agente de citas recibe lo mínimo para agendar (nombre de pila, clínica, franja, canal de contacto), nunca historia clínica.
4. **Derecho de acceso del paciente**: el modelo debe permitir compilar todo lo de un `patient_id` desde ambos EHR.
5. **Residencia de datos UK** [PENDIENTE]: hipótesis de trabajo, los datos de pacientes UK no salen de Reino Unido.
6. **Una sola API central** en `services/api/`; los EHR se integran con adaptadores simulados (`ehr_us`, `ehr_uk`).
