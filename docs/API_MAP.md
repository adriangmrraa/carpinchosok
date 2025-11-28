# Mapa de Endpoints API

## POST /api/auth/register
- **Archivo**: `app/api/auth/register/route.ts`
- **Request**: Body JSON con `dni`, `email`, `password`, `perfilPrivado`, `mostrarNombrePublico`, `mostrarVotosPublicos`, `lat`, `lng`. Tipos: Zod schema.
- **Response**: Usuario público (sin passwordHash) o error 400/500.
- **Auth**: Ninguna.
- **NocoDB**: Toca `PadronElectoral`, `Usuarios`. API v2.

## POST /api/auth/login
- **Archivo**: `app/api/auth/login/route.ts`
- **Request**: Body JSON con `dniOrEmail`, `password`.
- **Response**: Mensaje éxito o error 400/500. Setea cookie JWT.
- **Auth**: Ninguna.
- **NocoDB**: Toca `Usuarios`. API v2.

## POST /api/auth/verify-email
- **Archivo**: `app/api/auth/verify-email/route.ts`
- **Request**: Body JSON con `token`.
- **Response**: Mensaje éxito o error 400/500.
- **Auth**: Ninguna.
- **NocoDB**: Toca `Usuarios`. API v2.

## GET /api/auth/me
- **Archivo**: `app/api/auth/me/route.ts`
- **Request**: Cookie token.
- **Response**: Payload JWT (usuarioId, etc.) o 401.
- **Auth**: JWT en cookie.
- **NocoDB**: Ninguna.

## GET /api/propuestas
- **Archivo**: `app/api/propuestas/route.ts`
- **Request**: Ninguna.
- **Response**: Array de propuestas con contadores y autorNombre.
- **Auth**: Ninguna.
- **NocoDB**: Toca `Propuestas`, `Votos`, `Reportes`, `Usuarios`. API v2.

## POST /api/propuestas
- **Archivo**: `app/api/propuestas/route.ts`
- **Request**: Body JSON con `titulo`, `descripcion`. Cookie JWT.
- **Response**: Propuesta creada o error 400/500.
- **Auth**: JWT.
- **NocoDB**: Toca `Propuestas`. API v2.

## PATCH /api/propuestas/[id]
- **Archivo**: `app/api/propuestas/[id]/route.ts`
- **Request**: URL param `id`, body opcional `titulo`/`descripcion`. Cookie JWT.
- **Response**: Propuesta actualizada o error 400/500.
- **Auth**: JWT (solo autor).
- **NocoDB**: Toca `Propuestas`. API v2.

## DELETE /api/propuestas/[id]
- **Archivo**: `app/api/propuestas/[id]/route.ts`
- **Request**: URL param `id`. Cookie JWT.
- **Response**: Mensaje éxito o error 500.
- **Auth**: JWT (solo autor).
- **NocoDB**: Toca `Propuestas`. API v2.

## POST /api/propuestas/[id]/votar
- **Archivo**: `app/api/propuestas/[id]/votar/route.ts`
- **Request**: URL param `id`, body `valor` (1/-1/0). Cookie JWT.
- **Response**: Mensaje éxito o error 400/500.
- **Auth**: JWT.
- **NocoDB**: Toca `Votos`, `Notificaciones`. API v2.

## POST /api/propuestas/[id]/reportar
- **Archivo**: `app/api/propuestas/[id]/reportar/route.ts`
- **Request**: URL param `id`, body opcional `motivo`. Cookie JWT.
- **Response**: Mensaje éxito o error 400/500.
- **Auth**: JWT.
- **NocoDB**: Toca `Reportes`, `Notificaciones`. API v2.

## GET /api/usuarios/me
- **Archivo**: `app/api/usuarios/me/route.ts`
- **Request**: Cookie JWT.
- **Response**: Datos usuario + propuestas + votos.
- **Auth**: JWT.
- **NocoDB**: Toca `Usuarios`, `Propuestas`, `Votos`. API v2.

## GET /api/usuarios/[id]
- **Archivo**: `app/api/usuarios/[id]/route.ts`
- **Request**: URL param `id`.
- **Response**: Perfil público según privacidad.
- **Auth**: Ninguna.
- **NocoDB**: Toca `Usuarios`, `Propuestas`. API v2.

## PATCH /api/usuarios/me
- **Archivo**: `app/api/usuarios/me/route.ts`
- **Request**: Body con flags privacidad. Cookie JWT.
- **Response**: Usuario actualizado.
- **Auth**: JWT.
- **NocoDB**: Toca `Usuarios`. API v2.

## GET /api/notificaciones
- **Archivo**: `app/api/notificaciones/route.ts`
- **Request**: Query `?soloNoLeidas=true`. Cookie JWT.
- **Response**: Array notificaciones.
- **Auth**: JWT.
- **NocoDB**: Toca `Notificaciones`. API v2.

## POST /api/notificaciones/[id]/leer
- **Archivo**: `app/api/notificaciones/[id]/leer/route.ts`
- **Request**: URL param `id`. Cookie JWT.
- **Response**: Mensaje éxito.
- **Auth**: JWT.
- **NocoDB**: Toca `Notificaciones`. API v2.

Todos usan API v2 de NocoDB.