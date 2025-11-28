# Reporte de Auditoría

## Chequeos Automáticos Implementados

- **Auditoría de Variables de Entorno**: Verifica si las env usadas en el código están definidas.
- **Auditoría de Endpoints**: Lista rutas API encontradas vs documentadas.

## Cómo Correr
Ejecutar `npm run audit` (agregar a package.json: "audit": "ts-node scripts/audit.ts").

## Interpretación
- Env: OK si definida (muestra longitud), MISSING si no.
- Endpoints: Lista paths para comparar con API_MAP.md.

Actualizar documentación si cambian rutas/env.