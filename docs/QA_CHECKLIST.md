# Checklist de QA

## Auth
- Registro: Valida DNI en padrón, geolocalización real, unicidad, hashea password, envía email con token.
- Login: Verifica credenciales, check emailVerificado, genera JWT cookie.
- Verificación email: Valida token, marca verificado, limpia token.
- Manejo errores: DNI no en padrón, fuera zona, usuario existe, password wrong, email no verificado.

## Propuestas
- Crear: Autenticado, valida input, asigna autorId.
- Listar: Muestra contadores reales, autorNombre según privacidad.
- Editar: Solo autor, valida input.
- Eliminar: Solo autor.

## Votos
- Votar positivo/negativo: Crea/actualiza/borra, no duplicado, notifica.
- Cambiar: Actualiza valor.
- Deshacer: Borra voto.

## Reportes
- Reportar: Una vez por usuario/propuesta, notifica.

## Perfiles
- Propio: Datos, propuestas, votos positivos/negativos.
- Público: Nombre anónimo si privado, no votos si no mostrar; nombre real y votos si público y mostrar.
- Ownership: Solo autor edita/elimina propuestas, solo dueño marca notificaciones.

## Notificaciones
- Generación: En votos/reportes.
- Listado: Filtra no leídas.
- Marcar leída: Actualiza.

## Pitfalls
- JWT inválido/expirado.
- Env faltantes.
- Tipos inconsistentes TS/NocoDB.
- Exposición passwordHash/tokens.

## Debugging
- Logs Next/Vercel.
- Falla típica: NocoDB, env, auth.
- Simular: Sin padrón, sin votos.

## Deployment
- Env clave: NocoDB, JWT_SECRET.
- Smoke: Probar /api/propuestas.
- Serverless: Stateless, reintentos NocoDB.