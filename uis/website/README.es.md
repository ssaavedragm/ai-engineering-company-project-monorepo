# `uis/website`: sitio web público de HealthCore

> _También disponible en [inglés](./README.md)._

**Objetivo:** la primera presencia web profesional de HealthCore (Hito 1, fundamentos web). Una landing bilingüe (servicios, clínicas de EE. UU., contacto) y un **formulario de consulta para pacientes**, para que recepción pueda devolver la llamada con datos estructurados en lugar de tomarlos en llamadas de 20 minutos.

El contenido, los nombres de campos, las reglas de validación y los mensajes siguen exactamente [`BRIEFING.md`](./BRIEFING.md) (copia sin modificar del briefing del hito; versión en inglés en [`BRIEFING.en.md`](./BRIEFING.en.md)).

## Tecnología

- **HTML5** estático + **Tailwind CSS v4** mediante el Play CDN con versión fija (`@tailwindcss/browser@4.1.18`). Sin CSS escrito a mano.
- **JavaScript** con módulos ES para la validación. Sin dependencias ni paso de build.
- Tests con el runner integrado de Node (`node --test`, Node 22+).

> Excepción del Hito 1: la regla de `uis/` pide Next.js + TypeScript. El hito exige `index.html` / `application.html` / `validation.js` estáticos, así que Next.js se pospone a un hito posterior (ver `memory-bank/techContext.md`).

## Estructura

| Archivo | Propósito |
| --- | --- |
| `index.html` / `index.es.html` | Landing EN / ES: encabezado, hero, servicios, por qué HealthCore, ubicaciones, contacto y pie. Schema.org `MedicalOrganization` + un `MedicalClinic` por clínica de EE. UU. |
| `application.html` / `application.es.html` | Formulario de consulta EN / ES (16 campos + `patient_id` condicional). |
| `validators.js` | Reglas de validación puras (sin DOM), compartidas por la página y los tests. |
| `validation.js` | Capa DOM: validación en tiempo real, errores accesibles, campos condicionales, contador en vivo y envío simulado. |
| `assets/` | Logo/favicon e ilustración del hero (SVG). |
| `tests/validators.test.js` | Tests unitarios de cada regla del briefing (solo datos sintéticos). |

## Cómo ejecutar

Desde la **raíz del repositorio** (funciona en Codespaces):

```bash
npx http-server uis/website -p 3000 -a 0.0.0.0 -c-1
```

O desde esta carpeta: `npm start`. Abre <http://localhost:3000>. En Codespaces, abre la pestaña **Ports**, marca el puerto 3000 como **Public** y usa esa URL en PageSpeed Insights.

## Cómo testear

```bash
cd uis/website
node --test          # o: npm test
```

Lint: sin configurar (sitio estático sin toolchain).

## Reglas de validación (resumen)

- Nombre y apellido: solo letras (incluidas las acentuadas), de 2 a 50 caracteres. Se admiten espacios, guiones o apóstrofos sueltos entre letras para nombres compuestos (`María José`, `Ruiz-Pérez`).
- Fecha de nacimiento: no puede ser futura; edad de 0 a 120 años.
- Teléfono: empieza por `+` y el código de país, con 8 a 15 dígitos.
- Fecha preferida: desde el siguiente día hábil (lun–vie) hasta 60 días hacia adelante.
- Paediatric Care solo para menores de 18 años.
- Franja de tarde-noche (5pm–8pm) en una clínica que cierra antes de las 8pm → advertencia que no bloquea el envío. Una fecha en que la clínica elegida está cerrada (domingo, o sábado si no abre sábados) → advertencia que no bloquea el envío.
- `has_insurance = Yes` → aseguradora (máx. 100 caracteres) e ID de afiliado (6–20 alfanuméricos) obligatorios.
- `new_patient = No` → `patient_id` opcional (`HC-` + 6 alfanuméricos).
- Consulta médica de 20 a 500 caracteres, con contador en vivo. El consentimiento es obligatorio.

## Privacidad

El formulario solo **simula** el envío: no se envía, guarda (ni `localStorage` ni cookies) ni registra nada, y los datos se borran tras un "envío" correcto. Sin analítica de terceros. Los tests usan solo datos sintéticos.
