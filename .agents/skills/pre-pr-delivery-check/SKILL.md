---
name: pre-pr-delivery-check
description: Verifica que una rama de HealthCore Digital está lista para abrir un PR contra main. Úsala antes de cada PR o cuando pidan "revisa la entrega" o "¿está listo el PR?".
---

# Skill: checklist de entrega antes del PR

## Objetivo

Comprobar, con verificaciones reproducibles, que la rama actual cumple el protocolo de `AGENTS.md` y puede abrir un PR contra `main` sin incumplir el mapa de carpetas, la protección de datos de pacientes ni el memory bank.

## Inputs

| Input | Obligatorio | Quién lo da | Ejemplo |
| --- | --- | --- | --- |
| Nombre de la rama | Sí (por defecto, la actual: `git branch --show-current`) | Agente | `feature/agent-memory-bank` |
| Rama base | No (por defecto `main`) | Humano | `main` |
| Hito o tarea que cierra el PR | Sí | Humano | "Hito 4: AI-driven Engineering" |
| Proyectos tocados | Se deduce de `git diff --name-only main...HEAD` | Agente | `services/api`, `memory-bank` |

## Pasos

Ejecuta desde la raíz del repo y anota el resultado de cada paso (✅/❌ + salida relevante).

1. `git fetch origin && git diff --name-only origin/main...HEAD` → lista de archivos cambiados.
2. Cruza esa lista con las áreas protegidas de `AGENTS.md` §4.
3. `ls -d apps frontend backend api src web server client 2>/dev/null` → debe salir vacío.
4. Escaneo de datos sensibles: `git diff origin/main...HEAD | grep -nEi '([0-9]{3}-[0-9]{2}-[0-9]{4}|nhs[_ -]?number|api[_-]?key|secret|password)'`.
5. Para cada proyecto tocado con tooling configurado, ejecuta lint y tests con los comandos de `memory-bank/techContext.md` §6.
6. Comprueba que `memory-bank/progress.md` tiene una entrada de bitácora con la rama actual.
7. Para cada `README.md` o `README.es.md` cambiado, comprueba que su pareja también cambió.
8. Comprueba que los enlaces relativos de los `.md` cambiados apuntan a archivos existentes.
9. Redacta el informe y el borrador de descripción del PR.

## Criterios de aceptación

El check **pasa** solo si se cumplen todos:

- [ ] El paso 2 da cero archivos protegidos cambiados, **o** cada uno aparece en el informe con la frase "confirmado por humano" y quién lo confirmó.
- [ ] El paso 3 no imprime nada.
- [ ] El paso 4 tiene 0 coincidencias, o cada coincidencia está justificada en el informe como falso positivo (p. ej. el propio patrón en `AGENTS.md`).
- [ ] Lint y tests salen con código 0 en cada proyecto tocado que los tenga configurados; los que no, aparecen como `n/a (sin configurar)`.
- [ ] `grep -c "$(git branch --show-current)" memory-bank/progress.md` devuelve ≥ 1.
- [ ] Cada `README.md` cambiado tiene su `README.es.md` cambiado en la misma rama (y viceversa).
- [ ] 0 enlaces relativos rotos en los `.md` cambiados.
- [ ] Todos los mensajes de commit de la rama (`git log origin/main..HEAD --format=%s`) siguen `tipo(ámbito): descripción` con tipo en `feat|fix|docs|refactor|test|chore`.
- [ ] El borrador de PR apunta a `main`, nombra el hito e incluye un enlace a `AGENTS.md`.

## Output

1. Tabla con los 9 pasos y su resultado.
2. Veredicto: `LISTO PARA PR` o `NO LISTO`, con la lista de criterios fallidos.
3. Borrador de la descripción del PR (resumen, archivos clave, enlace a `AGENTS.md`, checklist de los criterios).

Esta skill **no** hace push ni abre el PR: eso requiere confirmación humana.
