# `uis/website` — HealthCore public website

> _Also available in [Spanish](./README.es.md)._

**Goal:** HealthCore's first professional web presence (Milestone 1 — Web fundamentals). A bilingual landing page (services, US clinics, contact) and a **patient enquiry form** so the front desk can call patients back with structured data instead of 20-minute phone intakes.

Content, field names, validation rules and messages follow [`BRIEFING.md`](./BRIEFING.md) exactly (unmodified copy of the milestone briefing; English version in [`BRIEFING.en.md`](./BRIEFING.en.md)).

## Technology

- Static **HTML5** + **Tailwind CSS v4** via the pinned Play CDN (`@tailwindcss/browser@4.1.18`). No hand-written CSS.
- Vanilla **JavaScript ES modules** for validation. No dependencies, no build step.
- Tests with Node's built-in runner (`node --test`, Node 22+).

> Milestone 1 exception: the `uis/` rule expects Next.js + TypeScript. The milestone requires static `index.html` / `application.html` / `validation.js`, so Next.js is postponed to a later milestone (see `memory-bank/techContext.md`).

## Structure

| File | Purpose |
| --- | --- |
| `index.html` / `index.es.html` | Landing page EN / ES: header, hero, services, why HealthCore, locations, contact, footer. Schema.org `MedicalOrganization` + one `MedicalClinic` per US clinic. |
| `application.html` / `application.es.html` | Patient enquiry form EN / ES (16 fields + conditional `patient_id`). |
| `validators.js` | Pure validation rules (no DOM), shared by the page and the tests. |
| `validation.js` | DOM layer: real-time validation, accessible errors, conditional fields, live counter, simulated submit. |
| `assets/` | Logo/favicon and hero illustration (SVG). |
| `tests/validators.test.js` | Unit tests for every briefing rule (synthetic data only). |

## How to run

From the **repository root** (works in Codespaces):

```bash
npx http-server uis/website -p 3000 -a 0.0.0.0 -c-1
```

Or from this folder: `npm start`. Open <http://localhost:3000>. In Codespaces, open the **Ports** tab, set port 3000 to **Public** and use that URL for PageSpeed Insights.

## How to test

```bash
cd uis/website
node --test          # or: npm test
```

Lint: not configured (static site without a toolchain).

## Validation rules (summary)

- Names: letters only (accents included), 2–50 characters. Single spaces, hyphens or apostrophes are allowed between letters for compound names (`María José`, `Ruiz-Pérez`).
- Date of birth: not in the future, age 0–120.
- Phone: starts with `+` and a country code, 8–15 digits.
- Preferred date: from the next business day (Mon–Fri) up to 60 days ahead.
- Paediatric Care only for patients under 18.
- Evening (5pm–8pm) at a clinic that closes before 8pm → non-blocking warning. A date when the chosen clinic is closed (Sunday, or Saturday without Saturday hours) → non-blocking warning.
- `has_insurance = Yes` → provider (≤100 characters) and member ID (6–20 alphanumerics) required.
- `new_patient = No` → optional `patient_id` (`HC-` + 6 alphanumerics).
- Health concern 20–500 characters with a live counter. Consent required.

## Privacy

The form only **simulates** submission: nothing is sent, stored (no `localStorage`/cookies) or logged, and the data is cleared after a successful "submit". No third-party analytics. Tests use synthetic data only.
