# Project context — HealthCore Digital

> _Also available in [Spanish](./CONTEXT.es.md)._

Operational summary for people and AI agents working in this monorepo: who the company is, what we are building, which domain data we use and under which constraints. Sources of truth: [`healthcore-BRIEFING.es.md`](./healthcore-BRIEFING.es.md) (company) and [`company-choice.md`](./company-choice.md) (chosen scope). Technical detail lives in [`memory-bank/`](./memory-bank/); the protocol for coding agents is in [`AGENTS.md`](./AGENTS.md).

Labels: **[DECIDED]** comes from a source or is already in the repo · **[PROPOSED]** default until someone changes it · **[PENDING]** missing data or a human decision.

## 1. The company in one line

HealthCore is an outpatient healthcare network (founded 2011, headquartered in Austin, Texas) with **12 clinics**: 9 in the US (Texas, Florida, Georgia) and 3 in the UK (London, Manchester). It offers primary care, specialist consultations, chronic disease management and preventive health. It has ~200 staff and ~USD 28M annual revenue. Its value proposition is access: same-day appointments, extended hours and bilingual English/Spanish staff in the US.

**HealthCore Digital** is the internal unit that builds the systems. This repo is its monorepo.

## 2. The problem we tackle

| Symptom (briefing) | Data |
| --- | --- |
| Two EHRs (US and UK) that do not talk to each other | Patient history does not follow the patient across clinics or countries |
| Bookings only by phone (US) or by calling the front desk with a manual diary (UK) | 0% online bookings |
| No-shows with no proactive outreach | **22%** network-wide, ~**USD 1.8M/year** in lost slots |
| No shared data layer, telemetry or centralised logs | Failures are discovered when a clinic calls |
| Incomplete audit trails | Data access requests (GDPR/HIPAA) are compiled by hand |

## 3. Project scope [DECIDED]

Three focus departments (see `company-choice.md`):

1. **Clinical Operations**: unified patient data, queryable from any clinic in both countries.
2. **Patient Experience & Access**: centralise appointment requests and their follow-up.
3. **Technology**: the central API that solves (1) and (2) and lays the groundwork for the rest.

**Product AI agent:** an appointment agent that receives the request, checks availability, books, confirms, sends reminders and handles changes.

**Out of scope** (context only): billing and claim denials (14%), HR and CME, AI-assisted clinical documentation, the full executive dashboard.

## 4. Key people

| Person | Role | What they expect from us |
| --- | --- | --- |
| Dr Sandra Okonkwo | CEO | Know this week's no-show rate without calling anyone. Rejects technology that does not solve a real problem. |
| Dr Marcus Reid | Director of Clinical Operations | Unified patient history across clinics and countries. |
| Priya Nair | Patient Experience & Access (London) | Online booking in both markets and fewer no-shows. |
| James Osei | CTO (team of 6, Austin) | One central API instead of today's patchwork. |
| Claire Whitfield | Compliance & Data Governance | Every system touching patient data must pass HIPAA **and** UK GDPR. De facto veto. |

## 5. Product users

- **Patient**: US in English or Spanish; UK in British English. Books, confirms, reschedules or cancels appointments.
- **Front desk**: manages their clinic's schedule.
- **Clinician**: views the unified patient history.
- **Leadership**: views appointment KPIs by clinic.

## 6. Domain data

Code, identifiers and fields in **English**; documentation in Spanish. Full conventions in [`memory-bank/techContext.md`](./memory-bank/techContext.md) §4.

### 6.1 Enumerations

| Type | Values | Status |
| --- | --- | --- |
| `Jurisdiction` | `US` \| `UK` | [DECIDED] |
| `AppointmentStatus` | `scheduled` \| `confirmed` \| `rescheduled` \| `cancelled` \| `completed` \| `no_show` | [PROPOSED] |
| `channel` | `phone` \| `front_desk` \| `web` \| `agent` | [PROPOSED] |
| `source_ehr` | `ehr_us` \| `ehr_uk` | [PROPOSED] |
| `service_type` | `Primary Care` · `Chronic Disease Management` · `Specialist Consultation` · `Preventive Health` · `Women's Health` · `Paediatric Care` · `Mental Health` | [DECIDED] (Milestone 1 briefing) |
| `preferred_time` | `Morning (7am–12pm)` · `Afternoon (12pm–5pm)` · `Evening (5pm–8pm)` | [DECIDED] (Milestone 1 briefing) |

### 6.2 Entities

| Entity | Key fields | Rules |
| --- | --- | --- |
| `Clinic` | `clinic_id`, `name`, `city`, `region`, `jurisdiction`, `timezone`, `opening_hours` | `clinic_id` = `{country}-{region}-{nn}` |
| `Patient` | `patient_id` (HealthCore UUID), `jurisdiction`, `source_ehr`, `source_record_id` | SSN and NHS number are never used as an ID nor exposed |
| `Appointment` | `appointment_id`, `patient_id`, `clinic_id`, `jurisdiction`, `service_type`, `start_at` (UTC), `status`, `channel` | `no_show` feeds the main KPI; `channel` measures online adoption |
| Web enquiry (Milestone 1) | The form fields in [`uis/website/BRIEFING.md`](./uis/website/BRIEFING.md) | Submission is simulated today; later it becomes an `Appointment` with `channel = web` |

Dates: stored in **UTC** (ISO 8601) and shown in the clinic's time zone.

### 6.3 Clinics

| `clinic_id` [PROPOSED] | Name | City | Time zone | Hours |
| --- | --- | --- | --- | --- |
| `us-tx-01` | HealthCore Austin Central | Austin, TX | `America/Chicago` | Mon–Fri 7am–8pm · Sat 9am–3pm |
| `us-tx-02` | HealthCore Austin North | Austin, TX | `America/Chicago` | Mon–Fri 8am–7pm |
| `us-tx-03` | HealthCore San Antonio | San Antonio, TX | `America/Chicago` | Mon–Fri 8am–6pm · Sat 9am–1pm |
| `us-fl-01` | HealthCore Miami | Miami, FL | `America/New_York` | Mon–Fri 7am–8pm · Sat 9am–4pm |
| `us-fl-02` | HealthCore Orlando | Orlando, FL | `America/New_York` | Mon–Fri 8am–6pm |
| `us-ga-01` | HealthCore Atlanta | Atlanta, GA | `America/New_York` | Mon–Fri 8am–7pm |

Clinic phone numbers are in the Milestone 1 briefing. **[PENDING]**: the briefings give no name or hours for the other 3 US clinics or the 3 UK clinics (London, Manchester; time zone `Europe/London`). Until there is official data, synthetic datasets treat them as clinics flagged as synthetic, and they are not shown on the public website.

## 7. KPIs

| KPI | Baseline | What moves or measures it |
| --- | --- | --- |
| Network no-show rate | 22% | `Appointment.status = no_show` by clinic and week; appointment agent reminders |
| Cost of lost slots | ~USD 1.8M/year | Derived from no-shows by clinic |
| Online bookings | 0% | Share of appointments with `channel = web` or `agent` |
| Patient history across clinics | Does not exist | A single `patient_id` queryable from any clinic |

## 8. Non-negotiable constraints

1. **Zero real patient data** in the repo: code, tests, fixtures, logs, prompts and `data/` use synthetic data only.
2. **HIPAA (US) and UK GDPR (UK)**: every entity carries its `jurisdiction` and every access to patient data is audited (who, what, when, jurisdiction).
3. **Minimum necessary**: each response returns only the fields the view needs. The appointment agent receives the minimum to book (first name, clinic, time slot, contact channel), never clinical history.
4. **Patient right of access**: the model must allow compiling everything about a `patient_id` from both EHRs.
5. **UK data residency** [PENDING]: working hypothesis, UK patient data does not leave the UK.
6. **One central API** in `services/api/`; EHRs are integrated through mock adapters (`ehr_us`, `ehr_uk`).
