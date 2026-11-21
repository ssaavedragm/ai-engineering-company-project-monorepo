---
description: Convenciones para uis/website y uis/backoffice (Next.js)
scope: path
globs: ["uis/**"]
---

# Regla: `uis/` (frontends)

**Alcance:** se aplica cuando se crean o editan archivos que coinciden con `uis/**`.

## Común a ambos proyectos

1. Next.js con App Router y TypeScript estricto (`"strict": true`). Gestor: **pnpm**.
2. Los tipos de dominio (`Clinic`, `Appointment`, `Jurisdiction`…) se importan de `@repo/shared-types`; prohibido redeclararlos localmente.
3. Toda llamada a datos pasa por `services/api` a través de un único cliente en `src/lib/api.ts`, que lee la URL base de `NEXT_PUBLIC_API_URL`. Nada de datos de pacientes hardcodeados.
4. Las fechas se muestran en la zona horaria de la clínica, no en la del navegador.
5. Comandos: `pnpm lint`, `pnpm typecheck` (`tsc --noEmit`), `pnpm dev` (puerto 3000).

## `uis/website/`: web pública

- La home vive en `/` (`app/page.tsx`). El copy sale del briefing: citas en el mismo día, horario ampliado, personal bilingüe, 12 clínicas en Texas, Florida, Georgia, Londres y Mánchester.
- Idiomas: `en` y `es` para EE.UU., `en-GB` para Reino Unido (rutas `/[locale]/…`).
- El flujo de reserva (`/[locale]/book`) es la **única** parte que recoge datos de paciente: los mínimos para la cita, con aviso de privacidad según la jurisdicción de la clínica (HIPAA o UK GDPR).
- Sin analítica de terceros en páginas que recojan datos de paciente.

## `uis/backoffice/`: app interna

- **Layout propio** (`app/layout.tsx` con navegación lateral); vista de entrada en `/` con el resumen de citas del día de la sede del usuario.
- Secciones previstas: `/schedule` (agenda por sede), `/patients/[patientId]` (historia unificada), `/metrics` (no-shows y reservas por canal y sede).
- Toda vista que muestre datos de paciente requiere sesión; ninguna página del backoffice es pública.
