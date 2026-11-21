---
description: Dónde vive cada tipo de código en el monorepo de HealthCore Digital
scope: always
globs: ["**/*"]
---

# Regla: estructura del monorepo

**Alcance:** siempre activa, en toda sesión y para cualquier archivo.

## Obligatorio

1. Todo frontend nuevo va en `uis/<proyecto>/`. Solo existen dos proyectos previstos:
   - `uis/website/`: web pública. Su home es la ruta `/`. Contiene marca, propuesta de valor, las 12 clínicas y el flujo de reserva online.
   - `uis/backoffice/`: app interna con **su propio layout** y vista de entrada en `/` (agenda por sede, historia unificada, dashboards).
2. Todo backend va en `services/`. La API central es **`services/api/`** (FastAPI). Un endpoint nuevo = un router nuevo o ampliado dentro de `services/api/`, nunca un servicio nuevo.
3. Solo se crea `services/<otro>/` para un worker que **no pueda** ejecutarse dentro de la API, y requiere confirmación humana y una entrada en `memory-bank/techContext.md` §3.
4. El agente del producto va en `agents/appointment-agent/`, creado copiando `agents/_template/`.
5. Toda carpeta nueva de proyecto incluye `README.md` **y** `README.es.md` con: objetivo, tecnología, cómo instalar, cómo ejecutar y cómo testear.
6. Código usado por `uis/` y `services/` a la vez → `packages/shared/` (área protegida: pide confirmación).

## Prohibido

- Crear en la raíz: `apps/`, `frontend/`, `backend/`, `api/`, `src/`, `web/`, `server/`, `client/`.
- Crear un segundo proyecto FastAPI o Next.js fuera de las rutas anteriores.
- Dejar archivos de código sueltos en la raíz (salvo configuración del workspace: `package.json`, `pnpm-workspace.yaml`, `pyproject.toml`, `docker-compose.yml`).
- Poner skills del producto en `.agents/skills/` o skills del agente de código en `skills/` (ver `techContext.md` §3).

## Verificación

```bash
# No debe imprimir nada:
ls -d apps frontend backend api src web server client 2>/dev/null
```
