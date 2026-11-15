# Project Brief — HealthCore Digital

> Fuente de verdad del negocio: [`healthcore-BRIEFING.es.md`](../healthcore-BRIEFING.es.md).
> Elección y alcance del estudiante: [`company-choice.md`](../company-choice.md).
> Si este archivo y el briefing se contradicen, **manda el briefing**; corrige este archivo.

## 1. La empresa

| Dato | Valor |
| --- | --- |
| Nombre | HealthCore (unidad interna que construye: **HealthCore Digital**) |
| Sector | Atención sanitaria ambulatoria: atención primaria, especialistas, crónicos, prevención |
| Fundación / sede | 2011, Austin, Texas |
| Red | **12 clínicas**: 9 en EE.UU. (Texas, Florida, Georgia) + 3 en Reino Unido (Londres, Mánchester) |
| Plantilla | ~200 personas (~120 clínicas) |
| Facturación | ~28 M USD/año |
| Propuesta de valor | Citas en el mismo día, horario ampliado, personal bilingüe (inglés/español) en EE.UU. |
| Marco legal | **HIPAA** (EE.UU.) y **UK GDPR** (Reino Unido): dos regímenes distintos para datos de pacientes |

### Personas clave (stakeholders)

| Persona | Rol | Qué le importa para este proyecto |
| --- | --- | --- |
| Dra. Sandra Okonkwo | CEO | Responder "¿cuál es nuestra tasa de no-shows esta semana?" sin hacer llamadas. Escéptica con tecnología que no resuelve un problema real. |
| Dr. Marcus Reid | Director de Operaciones Clínicas | Historia clínica unificada entre sedes y países; menos tiempo de documentación. |
| Priya Nair | Experiencia del Paciente y Acceso (Londres) | Reservas online unificadas y bajar el 22% de no-shows. |
| James Osei | CTO (equipo de 6 en Austin) | Una API central que sustituya el mosaico de sistemas sin integrar. |
| Claire Whitfield | Cumplimiento y Gobierno del Dato | Cada sistema que toque datos de pacientes debe pasar por HIPAA **y** UK GDPR. Tiene poder de veto de facto. |

## 2. El problema que resolvemos

HealthCore creció más rápido que sus sistemas. Hoy:

- **Dos EHR distintos** (EE.UU. y Reino Unido) que no se comunican: si un paciente cambia de sede o de país, su historia no le sigue.
- **Reservas fragmentadas**: por teléfono en EE.UU., llamando a recepción con agenda manual en Reino Unido. No hay reserva online.
- **22% de no-shows** en la red, unos **1,8 M USD/año** en huecos perdidos, y ningún sistema de recordatorio o contacto proactivo.
- **Sin capa de datos compartida**, sin telemetría y sin logs centralizados: los fallos se descubren cuando una clínica llama.
- El personal clínico dedica **35 min/día** a documentación que podría asistir la IA.

## 3. Alcance elegido (departamentos foco)

Del briefing, este proyecto se centra en **tres departamentos** (ver `company-choice.md`):

1. **Operaciones Clínicas**: datos de paciente unificados y consultables desde cualquier clínica en ambos países.
2. **Experiencia del Paciente y Acceso**: centralizar la solicitud de citas y su seguimiento.
3. **Tecnología**: construir la API central que resuelve (1) y (2) y deja la base para el resto de departamentos.

**Fuera de alcance por ahora:** Ciclo de Ingresos y Facturación (rechazos del 14%), Personas y Fuerza Laboral (CME, 47 días de contratación) y el dashboard ejecutivo completo. Se citan como contexto, pero no se construyen en estos hitos salvo que se decida lo contrario en `progress.md`.

## 4. Objetivos del proyecto

| # | Objetivo | Entregable | Dónde vive (ver `techContext.md` §3) |
| --- | --- | --- | --- |
| O1 | Una API central de HealthCore que unifique pacientes, citas y clínicas de ambos EHR | API FastAPI con routers por dominio y adaptadores EHR US/UK | `services/api/` |
| O2 | Reserva online unificada para ambos mercados | Flujo público de reserva | `uis/website/` → llama a `services/api/` |
| O3 | Reducir no-shows con contacto proactivo | **Agente de citas**: recibe la solicitud, consulta disponibilidad, agenda, confirma, envía recordatorios y gestiona cambios | `agents/appointment-agent/` (+ `workflows/` para recordatorios programados) |
| O4 | Visibilidad operativa para personal interno | Agenda por sede y dashboard de citas y no-shows | `uis/backoffice/` |
| O5 | Cumplimiento por diseño | Auditoría de acceso a datos de pacientes y separación por jurisdicción en cada endpoint | `services/api/` (middleware de auditoría), `docs/` |

## 5. KPIs y cómo se conectan con el código

| KPI (briefing) | Línea base | Objetivo del proyecto | Módulo/dataset que lo mueve o lo mide |
| --- | --- | --- | --- |
| Tasa de no-shows en la red | 22% | Medible por sede y semana; tendencia a la baja tras activar recordatorios | Estado `no_show` de `Appointment` en `services/api` (router `appointments`); recordatorios de `agents/appointment-agent`; métrica calculada en `data/pipelines/` |
| Coste de huecos perdidos | ~1,8 M USD/año | Se estima a partir de los no-shows por sede | Se deriva del KPI anterior en `data/process/` |
| Canales de reserva | 0% online | Reservas online disponibles en EE.UU. y Reino Unido | `uis/website` (flujo de reserva) + campo `channel` en `Appointment` (`phone`, `front_desk`, `web`, `agent`) |
| Historia del paciente entre sedes | No existe | Un paciente se consulta con un único `patient_id` de HealthCore desde cualquier sede | `services/api` router `patients` + adaptadores `ehr_us` / `ehr_uk` |
| Tiempo de documentación clínica | 35 min/día | Contexto: no se construye en este alcance | — |
| Rechazo de reclamaciones (EE.UU.) | 14% (sector 5–8%) | Contexto: fuera de alcance | — |

Regla: **ningún KPI se reporta con datos reales de pacientes en este repo**. Todo dataset en `data/` es sintético (ver `techContext.md` §5).

## 6. Usuarios del producto

- **Paciente** (EE.UU. en inglés o español; Reino Unido en inglés británico): reserva, confirma, cambia o cancela citas.
- **Recepción / personal de clínica**: gestiona la agenda de su sede desde el backoffice.
- **Clínico**: consulta la historia unificada del paciente.
- **Dirección y responsables de área**: consultan los KPIs de citas por sede.

## 7. Principios no negociables

1. **Privacidad primero**: HIPAA y UK GDPR aplican a todo lo que toque datos de pacientes. Ante la duda, no se procesa y se pregunta.
2. **Resolver un problema real** (criterio de la Dra. Okonkwo): cada funcionalidad debe trazarse a un KPI o necesidad del briefing.
3. **Una sola API central** en lugar de microservicios prematuros: el problema actual de HealthCore es justamente tener demasiados sistemas sin integrar.
4. **Dos países, una experiencia**: toda entidad lleva su jurisdicción (`US` | `UK`) y su zona horaria.
