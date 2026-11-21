---
name: accessibility-check
description: Audita y corrige la accesibilidad (WCAG 2.2 AA) de las interfaces de HealthCore en uis/: HTML semántico, teclado y foco, ARIA, contraste, formularios con errores anunciados, idioma EN/ES y movimiento reducido. Úsala al crear o editar páginas o componentes de uis/website o uis/backoffice, antes de un PR que los toque, o cuando pidan "revisa la accesibilidad", "a11y" o "WCAG".
---

# Skill: auditoría de accesibilidad (WCAG 2.2 AA)

## Objetivo

Asegurar que cualquier persona puede usar las interfaces de HealthCore, incluido el formulario de consulta de pacientes, con teclado, con lector de pantalla o con zoom, en inglés y en español. El nivel objetivo es **WCAG 2.2 AA**. Lighthouse solo detecta una parte de los problemas, así que esta skill combina auditoría automática y revisión manual guiada.

## Inputs

| Input | Obligatorio | Quién lo da | Ejemplo |
| --- | --- | --- | --- |
| Páginas o vistas a auditar | Sí (por defecto, las tocadas en la rama: `git diff --name-only origin/main...HEAD -- uis/`) | Agente | `application.html`, `application.es.html` |
| URL base del servidor | Sí | Agente | `http://localhost:3000` |
| Flujos críticos | No (por defecto: navegación principal, cambio de idioma y envío del formulario con errores y sin errores) | Humano | "reserva de cita" |

## Pasos

Anota el resultado de cada paso (✅/❌ + elemento afectado + criterio WCAG).

1. **Automático**: ejecuta Lighthouse con la categoría de accesibilidad en cada página (mismo comando que el paso 7 de la skill `seo-check`, con `--only-categories=accessibility`). Lista cada auditoría con `score < 1`.
2. **Estructura semántica** (1.3.1, 2.4.1, 2.4.6):
   - Hay `header`, `nav` con `aria-label` distinto si hay más de una, `main` y `footer`, y secciones con `aria-labelledby` hacia su encabezado.
   - Hay un enlace "Saltar al contenido" visible al recibir el foco.
   - Los encabezados son jerárquicos (un `h1`). Las listas de elementos son `ul`/`ol` y los datos de clínicas usan `dl` o una tabla con `th`.
3. **Imágenes e iconos** (1.1.1): cada `<img>` tiene `alt`. Si es informativa, el `alt` describe su contenido; si es decorativa (por ejemplo, el logo junto al texto "HealthCore"), lleva `alt=""`. Los SVG decorativos en línea llevan `aria-hidden="true"`.
4. **Idioma** (3.1.1, 3.1.2): `lang` del documento correcto. Los fragmentos en otro idioma (los enlaces EN/ES del selector) llevan su propio `lang`. En modo español **no** queda texto visible en inglés: ni etiquetas, ni placeholders, ni botones, ni errores, ni el mensaje de éxito. Excepción: los nombres propios del briefing, como "Paediatric Care" o los nombres de las clínicas.
5. **Teclado y foco** (2.1.1, 2.4.3, 2.4.7, 2.4.11):
   - Recorre cada página solo con `Tab`/`Shift+Tab`/`Enter`/`Espacio`/flechas. Todo lo interactivo es alcanzable, en un orden lógico y sin trampas de foco.
   - El foco siempre es visible (`focus-visible:outline-*`).
   - El header fijo no tapa el elemento con foco (`scroll-padding-top`, por ejemplo `scroll-pt-28` en `<html>`).
6. **Formularios** (1.3.1, 3.3.1, 3.3.2, 3.3.3, 4.1.3):
   - Cada control tiene un `<label for>`. Los grupos de radio van en `fieldset` + `legend`. Los obligatorios llevan `required` y un indicador explicado en texto.
   - Tipos de input adecuados (`email`, `tel`, `date`) y `autocomplete` en los datos personales (`given-name`, `family-name`, `bday`, `email`, `tel`).
   - Errores:
     - El texto es específico (los mensajes del briefing).
     - Están enlazados con `aria-describedby`, marcan el control con `aria-invalid="true"` y se anuncian mediante `aria-live`. El contenedor del mensaje permanece en el DOM; si se oculta con `hidden`, el anuncio se pierde.
     - Al enviar con errores, un resumen con `role="alert"` y el foco va al primer campo inválido.
   - Éxito: el mensaje recibe el foco o se anuncia.
   - Los campos condicionales ocultos van `disabled` para no entrar en el orden de tabulación.
7. **Contraste y color** (1.4.3, 1.4.11, 1.4.1):
   - Texto normal ≥ 4.5:1, texto grande y bordes de controles ≥ 3:1. En la paleta actual, `teal-700`/`teal-800` sobre blanco y `slate-600`+ sobre blanco cumplen; `slate-400` como texto **no**.
   - El error no se comunica solo con color: siempre hay texto.
8. **Responsive y zoom** (1.4.4, 1.4.10, 2.5.8):
   - Sin scroll horizontal a 320–375 px de ancho: comprueba `document.documentElement.scrollWidth <= innerWidth`.
   - El texto sigue legible con zoom al 200 %.
   - Los objetivos táctiles miden ≥ 24×24 px (radios y checkbox `h-5 w-5` con su etiqueta clicable).
9. **Movimiento** (2.3.3): animaciones y desplazamiento suave solo con `motion-safe:` (por ejemplo `motion-safe:scroll-smooth`) para respetar `prefers-reduced-motion`.
10. **Prueba de humo con navegador real** (opcional pero recomendada): un script con `puppeteer-core` en el **scratchpad** (nunca en el repo) que envíe el formulario vacío y compruebe el resumen, el foco, `aria-invalid` y los mensajes exactos. Debe emular `prefers-reduced-motion: reduce` para que el scroll suave no desvíe los clics. Usa solo datos sintéticos.
11. **Corrige** cada fallo con el cambio mínimo y repite los pasos afectados.

## Criterios de aceptación

El check **pasa** solo si se cumplen todos:

- [ ] Lighthouse Accessibility = **100** en todas las páginas auditadas (o cada auditoría pendiente justificada en el informe).
- [ ] 0 imágenes sin `alt` y 0 SVG decorativos sin `aria-hidden`.
- [ ] Todos los flujos críticos se completan solo con teclado, con foco visible y no tapado.
- [ ] Cada control de formulario tiene etiqueta accesible, y cada error es específico, está enlazado con `aria-describedby` y se anuncia.
- [ ] Contraste AA en texto y componentes, sin información transmitida solo por color.
- [ ] Sin scroll horizontal a 375 px y contenido usable al 200 % de zoom.
- [ ] Ningún texto en inglés en las páginas en español (salvo los nombres propios del briefing), y viceversa.
- [ ] Animaciones y scroll suave condicionados a `motion-safe:`.

## Output

1. Tabla de hallazgos: página, elemento, criterio WCAG, severidad (`bloqueante` / `mejora`), estado (`corregido` / `pendiente`).
2. Puntuación de Lighthouse Accessibility por página.
3. Veredicto: `A11Y OK` o `A11Y NO OK`, con los criterios fallidos.

Esta skill **no** sustituye una prueba con usuarios reales ni con lectores de pantalla (VoiceOver o NVDA). Si el cambio es grande, recomiéndala en el informe.
