---
name: seo-check
description: Audita y corrige el SEO técnico de las páginas públicas de HealthCore (uis/website): metadatos, hreflang EN/ES, Schema.org MedicalOrganization/MedicalClinic, estructura de encabezados y puntuación Lighthouse/PageSpeed. Úsala al crear o editar páginas de uis/website, antes de un PR que las toque, o cuando pidan "revisa el SEO", "PageSpeed" o "Schema.org".
---

# Skill: auditoría de SEO técnico

## Objetivo

Garantizar, con comprobaciones reproducibles, que cada página pública de `uis/website/` es indexable, se entiende en sus dos idiomas y describe a HealthCore con datos estructurados correctos. Además debe superar el umbral de rendimiento del hito: **≥ 80** (ideal ≥ 90) en PageSpeed Insights o Lighthouse.

Fuente del contenido y del JSON-LD: `uis/website/BRIEFING.md`. Si esta skill y el briefing se contradicen, manda el briefing.

## Inputs

| Input | Obligatorio | Quién lo da | Ejemplo |
| --- | --- | --- | --- |
| Páginas a auditar | Sí (por defecto, todos los `*.html` de `uis/website/`) | Agente | `index.html`, `index.es.html` |
| URL base del servidor | Sí | Agente | `http://localhost:3000` (local) o la URL pública de Codespaces |
| Dominio canónico | No (por defecto `https://www.healthcore.com`, el del briefing) | Humano | `https://www.healthcore.com` |

## Pasos

Ejecuta desde la raíz del repo y anota el resultado de cada paso (✅/❌ + evidencia).

1. **Servidor**: levanta el sitio con el comando de `memory-bank/techContext.md` §6 (`npx http-server uis/website -p 3000 -a 0.0.0.0 -c-1`) y confirma un `200` con `curl -s -o /dev/null -w "%{http_code}" <URL>/index.html`.
2. **Metadatos por página**: cada HTML tiene:
   - `<html lang="en">` o `lang="es"`, según el idioma real del contenido.
   - `<meta charset>` y `<meta name="viewport" content="width=device-width, initial-scale=1">`.
   - Un `<title>` único de 50–60 caracteres como guía, con la marca "HealthCore".
   - Una `<meta name="description">` única de 120–160 caracteres como guía, en el idioma de la página.
3. **hreflang**: cada página y su pareja de idioma enlazan entre sí con `<link rel="alternate" hreflang="en|es|x-default">` y **URLs absolutas** sobre el dominio canónico. Las URLs relativas hacen fallar la auditoría `hreflang` de Lighthouse.
4. **Encabezados**: exactamente un `<h1>` por página; `h2` → `h3` sin saltos de nivel. Comprobación rápida: `grep -o '<h[1-6]' <archivo> | sort | uniq -c`.
5. **Schema.org** (solo en la landing, en ambos idiomas):
   - Un bloque `application/ld+json` con el `MedicalOrganization` del briefing, con sus campos íntegros.
   - Un `MedicalClinic` por cada clínica de EE. UU. de la tabla de Ubicaciones, con `name`, `telephone` (E.164: `+1-512-340-8800`), `openingHours` (`Mo-Fr 07:00-20:00`) y `parentOrganization` apuntando al `@id` de la organización.
   - Valida que el JSON parsea: `node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"` sobre el contenido del bloque, o abre la página en <https://validator.schema.org/>.
6. **Enlaces y recursos**:
   - Todas las `<img>` tienen `width` y `height` (evita CLS) y `alt` (ver la skill `accessibility-check`).
   - Los enlaces internos (`index.html#locations`, `application.es.html`…) resuelven a archivos existentes.
   - Los teléfonos usan `tel:+1…` y los correos `mailto:`.
7. **Lighthouse** (local, requiere Chrome): por página,
   `CHROME_PATH="<ruta a Chrome>" npx --yes lighthouse@12.8.2 <URL>/<página> --quiet --chrome-flags="--headless=new" --output=json --output-path=<scratchpad>/lh-<página>.json`
   y extrae las puntuaciones con `node -e "const c=require('<json>').categories; for (const k in c) console.log(c[k].title, Math.round(c[k].score*100))"`. Guarda los JSON en el scratchpad, **nunca** en el repo.
8. **PageSpeed Insights** (para la entrega): con el puerto 3000 en **Public** en Codespaces, analiza la URL pública en <https://pagespeed.web.dev/> (móvil y escritorio). Si PageSpeed no llega a Codespaces, usa Lighthouse desde DevTools de Chrome contra la misma URL y adjunta la captura.
9. **Corrige** cada fallo con el cambio mínimo, vuelve al paso 7 y repite hasta cumplir los criterios. Fallos típicos y su arreglo:
   - `hreflang`: URLs absolutas.
   - `render-blocking-resources` por el Play CDN de Tailwind: es esperado con el CDN; mantén la página ligera (SVG en línea, sin imágenes pesadas ni fuentes externas).
   - `meta-description`: añádela en el idioma correcto.

## Criterios de aceptación

El check **pasa** solo si se cumplen todos:

- [ ] Cada página tiene `lang` correcto, `viewport`, `title` y `meta description` únicos y en su idioma.
- [ ] Cada página EN tiene su pareja ES (y viceversa) enlazada con `hreflang` absolutos, incluido `x-default`.
- [ ] Exactamente un `<h1>` por página y ningún salto de nivel de encabezado.
- [ ] La landing EN y ES contiene el `MedicalOrganization` del briefing y un `MedicalClinic` por clínica de EE. UU., con JSON válido.
- [ ] 0 enlaces internos rotos.
- [ ] Lighthouse local: **Performance ≥ 80** y **SEO ≥ 90** en todas las páginas auditadas.
- [ ] Para la entrega del hito: la captura de PageSpeed o Lighthouse sobre la URL pública es ≥ 80 y queda referenciada en la descripción del PR.

## Output

1. Tabla página × paso (✅/❌) con la evidencia de cada fallo.
2. Puntuaciones de Lighthouse por página (Performance, Accessibility, Best Practices, SEO).
3. Veredicto: `SEO OK` o `SEO NO OK`, con la lista de criterios fallidos y los cambios aplicados.

Esta skill **no** despliega, no publica la URL de Codespaces y no edita `BRIEFING.md`.
