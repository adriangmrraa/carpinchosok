# Contexto del Proyecto: Plataforma de Participación Vecinal

## Arquitectura del Proyecto

### Estructura de Carpetas
- `app/`: Contiene el layout raíz y páginas del App Router (e.g., `page.tsx`).
- `pages/`: Páginas del Pages Router (e.g., `index.tsx`, `registro.tsx`, `login.tsx`, `perfil.tsx`).
- `app/api/`: API Routes del App Router (endpoints principales).
- `lib/`: Lógica de dominio y utilitarios.
  - `nocodb.ts`: Cliente para interactuar con NocoDB.
  - `auth.ts`: Utilitarios de autenticación (hash, JWT, geolocalización).
- `types.ts`: Interfaces de dominio (PadronElectoral, UsuarioApp, Propuesta, etc.).
- `.env.local`: Variables de entorno para NocoDB y JWT.

El proyecto mezcla App Router (para APIs modernas) y Pages Router (para páginas legacy), conviviendo sin conflictos.

### Decisiones Técnicas y Patrones
- **Next.js + TypeScript**: Framework full-stack con SSR/SSG, tipado fuerte para robustez.
- **API Routes como Backend**: Serverless handlers en `/api/`, stateless, integrados con Next.js.
- **NocoDB como DB**: API REST para datos, evitando gestión directa de DB.
- **JWT para Auth**: Tokens en cookies httpOnly, payload con usuarioId y flags de privacidad.
- **Patrones**: Helpers en `lib/`, Zod para validación, async/await para APIs, manejo de errores consistente.

## Flujos de Datos y UX

### Registro
1. Usuario ingresa DNI, email, password, lat/lng.
2. Validar DNI en PadronElectoral, geolocalización dummy, unicidad.
3. Hashear password, crear UsuarioApp, enviar email dummy.
4. Redirigir a login.

### Login
1. Usuario ingresa DNI/email + password.
2. Verificar credenciales, generar JWT en cookie.
3. Redirigir a feed.

### Creación de Propuestas
1. Usuario autenticado envía titulo/descripcion.
2. Validar, crear en DB con autorId del JWT.

### Votos
1. Usuario vota 1/-1/0 en propuesta.
2. Verificar no duplicado, actualizar/crear/borrar, notificar autor.

### Reportes
1. Usuario reporta propuesta (único por usuario/propuesta).
2. Crear reporte, notificar autor.

### Privacidad de Perfil
- Perfil privado: nombre "Anónimo", no mostrar votos.
- Público: mostrar nombre y votos si flag activado.

### Notificaciones
- Creadas en votos/reportes.
- Listadas en perfil, marcadas como leídas.

## Guía para Futuras Tareas
- **TODOs**: Geolocalización real, email real, ownership checks completos.
- **Próximos Pasos**: Integrar email provider, mejorar geo, añadir tests.
- **Criterios PRs**: Tipado estricto, Zod en inputs, no exponer sensibles, usar nocodb.ts únicamente.