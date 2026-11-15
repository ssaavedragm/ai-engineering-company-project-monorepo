---
description: Convenciones para la API central FastAPI de HealthCore
scope: path
globs: ["services/**"]
---

# Regla: `services/` (API central FastAPI)

**Alcance:** se aplica cuando se crean o editan archivos que coinciden con `services/**`.

## Estructura de `services/api/`

```text
services/api/
├── pyproject.toml            # uv; dependencias y config de ruff/pytest
├── README.md / README.es.md
├── app/
│   ├── main.py               # crea FastAPI() e incluye routers; nada de lógica
│   ├── core/                 # config (pydantic-settings), auditoría, seguridad
│   ├── routers/              # un archivo por dominio: clinics.py, patients.py, appointments.py, availability.py
│   ├── schemas/              # modelos Pydantic de request/response por dominio
│   ├── services/             # lógica de negocio; los routers solo validan y delegan
│   └── integrations/
│       ├── ehr_us/           # adaptador EHR EE.UU. (mock al inicio)
│       └── ehr_uk/           # adaptador EHR Reino Unido (mock al inicio)
└── tests/                    # espejo de app/: tests/routers/test_appointments.py
```

## Obligatorio

1. Rutas versionadas, en plural y kebab-case: `/v1/clinics`, `/v1/appointments/{appointment_id}`.
2. Cada router declara `tags=[<dominio>]` y `response_model` en cada endpoint.
3. Los routers importan de `app.services.*`, nunca de `app.integrations.*` directamente. Los dos adaptadores EHR implementan la misma interfaz (`EHRAdapter`), y la capa de servicio elige el adaptador por `jurisdiction`.
4. Fechas en UTC con `datetime` *aware*; la conversión a la zona de la clínica (`America/Chicago`, `America/New_York`, `Europe/London`) se hace en la respuesta o en la UI.
5. Los enums de dominio (`Jurisdiction`, `AppointmentStatus`, `channel`) se definen una vez en `app/schemas/` y se reflejan en `packages/shared/types/` con los mismos valores.
6. Cada endpoint nuevo trae tests: al menos un caso feliz y un caso de error (404/422), con datos sintéticos.
7. Configuración y secretos vía variables de entorno (`pydantic-settings`), documentados en `services/api/.env.example`.

## Comandos (desde `services/api/`)

```bash
uv sync
uv run ruff format . && uv run ruff check .
uv run pytest
uv run fastapi dev app/main.py   # http://localhost:8000/docs
```

Al crear el proyecto, copia estos comandos reales a `memory-bank/techContext.md` §6.
