# 🐾 Carpinchos OK - Plataforma de Participación Ciudadana

Una plataforma completa de participación ciudadana construida con Next.js, TypeScript y NocoDB para fomentar la participación comunitaria y la toma de decisiones democráticas.

## 🌟 Características Principales

### 👥 Sistema de Usuarios
- **Registro con validación** del padrón electoral y geolocalización
- **Verificación de email** vía n8n webhook (emails automáticos)
- **Autenticación JWT** segura con cookies HTTP-only
- **Perfiles públicos/privados** con controles de privacidad granulares
- **Configuración personal** de visibilidad de datos

### 📝 Gestión de Propuestas
- **CRUD completo** de propuestas (Crear, Leer, Actualizar, Eliminar)
- **Sistema de votación inteligente** (+1/-1) con prevención de duplicados
- **Reportes de contenido** para moderación
- **Eliminación en cascada** automática de votos relacionados
- **Páginas individuales** para cada propuesta con navegación completa

### 🗺️ Navegación Intuitiva
- **URLs semánticas** para propuestas (`/propuestas/[id]`) y perfiles (`/usuarios/[id]`)
- **Links clickeables** en todas las tarjetas de propuestas
- **Nombres de autores** como links a perfiles públicos
- **Navegación responsive** optimizada para móvil

### 🔒 Privacidad y Seguridad
- **Control granular** sobre qué datos mostrar públicamente
- **Validación robusta** en frontend y backend
- **Manejo seguro** de contraseñas y tokens
- **Protección contra** manipulación de datos
- **Geolocalización opcional** (actualmente deshabilitada para pruebas)

### 📱 Experiencia Móvil
- **Diseño completamente responsive** con Tailwind CSS
- **Menú móvil** con dropdowns optimizados
- **Navegación por tabs** horizontalmente scrollable
- **Botones de votación** adaptados para touch
- **Sin scroll horizontal** en ningún dispositivo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 16** con Pages Router + App Router híbrido
- **TypeScript** para tipado completo y robusto
- **Tailwind CSS** para estilos responsive y mobile-first
- **Context API** para gestión de estado global
- **React Hooks** para manejo de estado local

### Backend
- **API Routes** de Next.js (App Router)
- **Autenticación JWT** con cookies HTTP-only seguras
- **Validación Zod** en todos los endpoints
- **NocoDB** como base de datos (API v1/v2)
- **n8n** para envío automático de emails de verificación

### DevOps & Deployment
- **Vercel** para despliegue automático y CDN global
- **Git** para control de versiones con GitHub
- **ESLint** para linting y calidad de código
- **Build optimizado** para producción con Turbopack

## 🚀 Instalación y Despliegue

### 🌐 Despliegue en Producción (Vercel)

#### ✅ Despliegue Automático:
1. **Repositorio en GitHub:**
   - URL: `https://github.com/adriangmrraa/carpinchosok.git`
   - Rama principal: `master`

2. **Configura las variables de entorno en Vercel:**
   Ve a Project Settings > Environment Variables y agrega:
   ```env
   # NocoDB Configuration
   NOCODB_BASE_URL=https://n8n-nocodbgala.yn8wow.easypanel.host
   NOCODB_API_TOKEN=2d5heGJbbUx9D_CUQwpxDNaNNjq4UIYbGjuRec_H
   NOCODB_BASE_SLUG=pgbvayxguam9h71
   NOCODB_BASE_ID=pgbvayxguam9h71

   # Table IDs for API v2 (GET/POST operations)
   NOCODB_TABLE_ID_PADRON=mphqy3zrto3ivsz
   NOCODB_TABLE_ID_USUARIOS=mtga492zgykafjm
   NOCODB_TABLE_ID_PROPUESTAS=mbn0wr6qdbbq7s8
   NOCODB_TABLE_ID_VOTOS=m34l02ugjvwbt8x
   NOCODB_TABLE_ID_REPORTES=mvx86wuqsg3v7pk
   NOCODB_TABLE_ID_NOTIFICACIONES=m8n7ysg9ul1qasy

   # Table names for API v1 (PATCH/DELETE operations)
   NOCODB_TABLE_NAME_PADRON=padron_electoral_csv
   NOCODB_TABLE_NAME_USUARIOS=usuarios_csv
   NOCODB_TABLE_NAME_PROPUESTAS=propuestas_csv
   NOCODB_TABLE_NAME_VOTOS=votos_csv
   NOCODB_TABLE_NAME_REPORTES=reportes_csv
   NOCODB_TABLE_NAME_NOTIFICACIONES=notificaciones_csv

   # Auth Configuration
   JWT_SECRET=super_secret_jwt_key_for_propuestas_ciudadanas_2024

   # Geolocation Configuration (actualmente deshabilitada)
   GEO_CENTER_LAT=-34.711673
   GEO_CENTER_LNG=-58.324775
   GEO_RADIUS_KM=50

   # Email Configuration (n8n webhook)
   N8N_VERIFICATION_SECRET=your_n8n_secret_here
   BASE_URL=https://carpinchosok.vercel.app
   ```

3. **Configuración de n8n para emails:**
   - Webhook URL: `https://n8n-n8n.yn8wow.easypanel.host/webhook/verification`
   - Secret: Configurar en variable `N8N_VERIFICATION_SECRET`

4. **Deploy automático:**
   - Vercel detectará automáticamente la configuración Next.js 16
   - Build optimizado con Turbopack
   - URL de producción: `https://carpinchosok.vercel.app`

### Opción 2: Instalación Local 💻

#### Prerrequisitos
- Node.js 18+
- npm o yarn
- Base de datos NocoDB configurada

#### Instalación Local

1. **Clona el repositorio:**
```bash
git clone https://github.com/adriangmrraa/carpinchosok.git
cd carpinchosok
```

2. **Instala dependencias:**
```bash
npm install
```

3. **Configura variables de entorno:**
Crea un archivo `.env.local` con las variables mostradas arriba.

4. **Ejecuta la aplicación:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
carpinchosok/
├── app/                    # API Routes (App Router)
│   ├── api/
│   │   ├── auth/          # Autenticación (login, register, verify-email)
│   │   ├── propuestas/    # Gestión de propuestas (CRUD + voting)
│   │   ├── usuarios/      # Perfiles de usuario (public/private)
│   │   └── votos/         # Sistema de votación
│   ├── favicon.ico        # Icono de la aplicación
│   ├── globals.css        # Estilos globales Tailwind
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio (App Router)
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Card, Input)
│   ├── CreateProposalForm.tsx    # Formulario de creación
│   ├── EditProposalModal.tsx     # Modal de edición
│   ├── Layout.tsx               # Layout con navegación
│   ├── ProposalCard.tsx         # Tarjeta de propuesta
│   ├── UserContext.tsx          # Context de autenticación
│   └── *.tsx                    # Otros componentes
├── lib/                  # Utilidades y configuración
│   ├── auth.ts           # Autenticación JWT + geolocalización
│   ├── nocodb.ts         # Cliente NocoDB (API v1/v2)
│   └── email.ts          # Configuración de emails n8n
├── pages/                # Páginas (Pages Router)
│   ├── _app.tsx          # App principal con providers
│   ├── index.tsx         # Feed principal de propuestas
│   ├── login.tsx         # Página de login
│   ├── registro.tsx      # Página de registro
│   ├── perfil.tsx        # Perfil privado del usuario
│   ├── propuestas/       # Páginas individuales de propuestas
│   │   └── [id].tsx      # Página de propuesta individual
│   └── usuarios/         # Perfiles públicos
│       └── [id].tsx      # Perfil público de usuario
├── docs/                 # Documentación del proyecto
│   ├── API_MAP.md        # Mapa de APIs
│   ├── DB_MAP.md         # Mapa de base de datos
│   ├── CONTEXT.md        # Contexto del proyecto
│   ├── QA_CHECKLIST.md   # Checklist de QA
│   └── AUDIT_REPORT.md   # Reporte de auditoría
├── scripts/              # Scripts de utilidad
│   ├── audit.ts          # Script de auditoría
│   └── test-connection.ts # Test de conexión NocoDB
├── types.ts              # Definiciones TypeScript
├── tailwind.config.js    # Configuración Tailwind CSS
├── next.config.ts        # Configuración Next.js
├── package.json          # Dependencias y scripts
└── README.md             # Esta documentación
```

## 🎯 Funcionalidades por Módulo

### 👤 Autenticación y Usuarios
- ✅ **Registro con validación de padrón electoral** (DNI requerido)
- ✅ **Verificación de email automática** vía n8n webhook
- ✅ **Inicio de sesión seguro** con JWT y cookies HTTP-only
- ✅ **Geolocalización opcional** (deshabilitada para pruebas)
- ✅ **Recuperación de contraseña** (preparado para implementación)

### 📝 Gestión de Propuestas
- ✅ **Crear propuestas** con formulario validado y rich text
- ✅ **Editar propuestas propias** con modal integrado
- ✅ **Eliminar propuestas** con eliminación en cascada de votos
- ✅ **Votar a favor/en contra** (una vez por usuario, inteligente)
- ✅ **Reportar contenido** inapropiado para moderación
- ✅ **Páginas individuales** para cada propuesta (`/propuestas/[id]`)

### 👥 Perfiles y Privacidad
- ✅ **Perfil privado completo** con tabs (propuestas, votos, configuración)
- ✅ **Perfiles públicos navegables** (`/usuarios/[id]`) con privacidad
- ✅ **Configuración granular de privacidad** (nombre, votos, perfil público)
- ✅ **Historial completo** de votos y propuestas
- ✅ **Estadísticas de usuario** (propuestas creadas, votos emitidos)

### 🗺️ Navegación y UX
- ✅ **URLs semánticas** y SEO-friendly (`/propuestas/123`, `/usuarios/456`)
- ✅ **Links clickeables** en tarjetas de propuestas y nombres de autores
- ✅ **Navegación intuitiva** con breadcrumbs y botones de retorno
- ✅ **Responsive completo** optimizado para móvil y desktop
- ✅ **Sin scroll horizontal** en ningún dispositivo

### 📱 Experiencia Móvil
- ✅ **Diseño mobile-first** con Tailwind CSS
- ✅ **Menú hamburguesa** con dropdowns optimizados
- ✅ **Tabs horizontalmente scrollables** en perfiles
- ✅ **Botones touch-friendly** para votación
- ✅ **Navegación por gestos** natural

### 🔧 Sistema y Backend
- ✅ **API REST completa** con validación Zod
- ✅ **Base de datos NocoDB** con mapeo automático de campos
- ✅ **Eliminación en cascada** automática de datos relacionados
- ✅ **Logs detallados** para debugging y monitoreo
- ✅ **Manejo de errores** robusto en frontend y backend

## 🔧 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build para producción
npm run start        # Inicia servidor de producción
npm run lint         # Ejecuta ESLint
```

## 🌐 URLs y Estado del Proyecto

### 📍 URLs de Producción
- **Aplicación principal**: `https://carpinchosok.vercel.app`
- **API de verificación de email**: `/api/auth/verify-email`
- **Webhook n8n**: `https://n8n-n8n.yn8wow.easypanel.host/webhook/verification`

### � Base de Datos NocoDB

La aplicación utiliza **NocoDB** con las siguientes tablas:

- **padron_electoral_csv**: Datos del padrón electoral para validación
- **usuarios_csv**: Usuarios registrados con perfiles y configuración
- **propuestas_csv**: Propuestas ciudadanas con metadata completa
- **votos_csv**: Sistema de votación con prevención de duplicados
- **reportes_csv**: Reportes de contenido para moderación
- **notificaciones_csv**: Sistema de notificaciones push

### ⚙️ Estado Actual de Funcionalidades

#### ✅ **Completamente Funcional**
- Sistema de registro con validación de padrón
- Verificación de email vía n8n
- Autenticación JWT completa
- CRUD completo de propuestas
- Sistema de votación inteligente
- Perfiles públicos y privados
- Navegación completa con URLs semánticas
- Diseño responsive móvil y desktop
- Eliminación en cascada automática

#### 🔄 **Configurado pero Deshabilitado**
- **Geolocalización**: Preparada para Buenos Aires (50km radio) pero deshabilitada para facilitar pruebas

#### 🚀 **Listo para Producción**
- Build optimizado con Next.js 16
- Despliegue automático en Vercel
- Configuración completa de variables de entorno
- Logs detallados para monitoreo
- Manejo robusto de errores

## 📦 Dependencias Principales

```json
{
  "next": "^16.0.3",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "zod": "^3.22.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "crypto": "built-in"
}
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Build optimizado para producción
npm run start        # Servidor de producción
npm run lint         # ESLint para calidad de código

# Testing y Utilidades
npm run audit        # Auditoría de seguridad y dependencias
npm run test-db      # Test de conexión a NocoDB
```

## 🔍 Monitoreo y Logs

### Vercel Logs
- **Function Logs**: Para ver logs de API routes
- **Build Logs**: Para ver proceso de construcción
- **Runtime Logs**: Para ver errores en producción

### Logs de Debug Incluidos
- ✅ Verificación de email con logs detallados
- ✅ Conexión a NocoDB con información de queries
- ✅ Errores de autenticación y validación
- ✅ Operaciones de CRUD con confirmaciones

## 🚨 Solución de Problemas

### Verificación de Email
Si hay problemas con la verificación:
1. Revisar logs de Vercel en "Function Logs"
2. Verificar configuración del webhook n8n
3. Comprobar variables `N8N_VERIFICATION_SECRET` y `BASE_URL`

### Conexión a NocoDB
Si hay problemas de conexión:
1. Verificar variables de entorno en Vercel
2. Comprobar conectividad a `n8n-nocodbgala.yn8wow.easypanel.host`
3. Revisar permisos de API token

### Problemas de Build
Si el build falla:
1. Verificar compatibilidad de Next.js 16
2. Comprobar variables de entorno requeridas
3. Revisar logs de build en Vercel

## 🤝 Contribución

1. Fork el proyecto desde `https://github.com/adriangmrraa/carpinchosok.git`
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**Adrián G. M. R.** - *Desarrollo completo y mantenimiento*

- **Email**: adrian276200@gmail.com
- **GitHub**: [@adriangmrraa](https://github.com/adriangmrraa)
- **LinkedIn**: [Adrián G. M. R.](https://linkedin.com/in/adriangmrraa)

## 📅 Historial de Versiones

### v1.0.0 (Noviembre 2025)
- ✅ Lanzamiento inicial completo
- ✅ Sistema de participación ciudadana funcional
- ✅ Verificación de email vía n8n
- ✅ Perfiles públicos con navegación completa
- ✅ Diseño responsive móvil optimizado
- ✅ Despliegue en producción con Vercel

## 🙏 Agradecimientos

- **Next.js Team** por el excelente framework React
- **NocoDB Community** por la base de datos sin código
- **Tailwind CSS** por el sistema de estilos utility-first
- **Vercel** por la plataforma de despliegue
- **n8n** por la automatización de emails
- **Comunidad Open Source** por las herramientas y librerías

---

## 🎉 ¡Listo para la Participación Ciudadana!

**Carpinchos OK** está completamente funcional y listo para fomentar la participación ciudadana en tu comunidad. La plataforma combina tecnología moderna con facilidad de uso para crear un espacio seguro y efectivo para la toma de decisiones democráticas.

### 🚀 Próximos Pasos Recomendados:
1. **Activar geolocalización** cuando esté listo para producción
2. **Configurar notificaciones push** para engagement
3. **Agregar sistema de moderación** avanzado
4. **Implementar analytics** para métricas de participación

**¡Únete a la revolución de la participación ciudadana con Carpinchos OK!** 🐾✨
