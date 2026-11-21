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

## Excepción: `uis/website/` en el Hito 1 (fundamentos web)

Autorizada por el estudiante el 2026-11-20. El hito exige un sitio **estático**: `index.html`, `application.html` y `validation.js`, más sus versiones `.es.html`, con Tailwind CSS (Play CDN con versión fija) y JavaScript sin build. Mientras dure esa versión:

- Los puntos 1, 3 y 5 de "Común a ambos proyectos" (Next.js, cliente `src/lib/api.ts`, comandos pnpm) **no aplican** a `uis/website/`.
- Se mantienen: copy fiel al briefing, sin datos de paciente persistidos ni enviados (el formulario solo simula el envío), sin analítica de terceros y tests con `node --test`.
- La migración a Next.js se hará en un hito posterior. Cuando ocurra, borra esta sección.

## `uis/website/`: web pública

- La home vive en `/` (`app/page.tsx`). El copy sale del briefing: citas en el mismo día, horario ampliado, personal bilingüe, 12 clínicas en Texas, Florida, Georgia, Londres y Mánchester.
- Idiomas: `en` y `es` para EE.UU., `en-GB` para Reino Unido (rutas `/[locale]/…`).
- El flujo de reserva (`/[locale]/book`) es la **única** parte que recoge datos de paciente: los mínimos para la cita, con aviso de privacidad según la jurisdicción de la clínica (HIPAA o UK GDPR).
- Sin analítica de terceros en páginas que recojan datos de paciente.

## `uis/backoffice/`: app interna

- **Layout propio** (`app/layout.tsx` con navegación lateral); vista de entrada en `/` con el resumen de citas del día de la sede del usuario.
- Secciones previstas: `/schedule` (agenda por sede), `/patients/[patientId]` (historia unificada), `/metrics` (no-shows y reservas por canal y sede).
- Toda vista que muestre datos de paciente requiere sesión; ninguna página del backoffice es pública.
