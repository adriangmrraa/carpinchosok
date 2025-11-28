# 🐾 Carpinchos OK - Plataforma de Participación Ciudadana

Una plataforma completa de participación ciudadana construida con Next.js, TypeScript y NocoDB para fomentar la participación comunitaria y la toma de decisiones democráticas.

## 🌟 Características Principales

### 👥 Sistema de Usuarios
- **Registro con validación** del padrón electoral
- **Autenticación JWT** segura con cookies HTTP-only
- **Perfiles públicos/privados** con controles de privacidad granulares
- **Configuración personal** de visibilidad de datos

### 📝 Gestión de Propuestas
- **CRUD completo** de propuestas (Crear, Leer, Actualizar, Eliminar)
- **Sistema de votación inteligente** (+1/-1) con prevención de duplicados
- **Reportes de contenido** para moderación
- **Eliminación en cascada** automática de votos relacionados

### 🗺️ Navegación Intuitiva
- **Páginas individuales** para cada propuesta
- **Perfiles públicos** con navegación completa
- **Links clickeables** en tarjetas de propuestas y nombres de usuarios
- **URLs únicas** para propuestas y perfiles

### 🔒 Privacidad y Seguridad
- **Control granular** sobre qué datos mostrar públicamente
- **Validación robusta** en frontend y backend
- **Manejo seguro** de contraseñas y tokens
- **Protección contra** manipulación de datos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 13+** con Pages Router
- **TypeScript** para tipado completo
- **Tailwind CSS** para estilos responsive
- **Context API** para gestión de estado global

### Backend
- **API Routes** de Next.js
- **Autenticación JWT** con cookies seguras
- **Validación Zod** en todos los endpoints
- **NocoDB** como base de datos

### DevOps
- **Git** para control de versiones
- **ESLint** para linting
- **Build optimizado** para producción

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Base de datos NocoDB configurada

### Instalación

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
Crea un archivo `.env.local` con:
```env
# NocoDB Configuration
NOCODB_BASE_URL=your_nocodb_url
NOCODB_API_TOKEN=your_api_token
NOCODB_BASE_SLUG=your_base_slug
NOCODB_TABLE_ID_PADRON=your_padron_table_id
NOCODB_TABLE_ID_USUARIOS=your_users_table_id
NOCODB_TABLE_ID_PROPUESTAS=your_proposals_table_id
NOCODB_TABLE_ID_VOTOS=your_votes_table_id
NOCODB_TABLE_ID_REPORTES=your_reports_table_id
NOCODB_TABLE_ID_NOTIFICACIONES=your_notifications_table_id

# Table Names for API v1
NOCODB_TABLE_NAME_PADRON=your_padron_table_name
NOCODB_TABLE_NAME_USUARIOS=your_users_table_name
NOCODB_TABLE_NAME_PROPUESTAS=your_proposals_table_name
NOCODB_TABLE_NAME_VOTOS=your_votes_table_name
NOCODB_TABLE_NAME_REPORTES=your_reports_table_name
NOCODB_TABLE_NAME_NOTIFICACIONES=your_notifications_table_name
```

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
│   │   ├── auth/          # Autenticación
│   │   ├── propuestas/    # Gestión de propuestas
│   │   ├── usuarios/      # Perfiles de usuario
│   │   └── votos/         # Sistema de votación
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base
│   └── *.tsx             # Componentes específicos
├── lib/                  # Utilidades y configuración
│   ├── auth.ts           # Autenticación
│   ├── nocodb.ts         # Cliente de base de datos
│   └── email.ts          # Envío de emails
├── pages/                # Páginas (Pages Router)
│   ├── index.tsx         # Página principal
│   ├── login.tsx         # Inicio de sesión
│   ├── registro.tsx      # Registro de usuarios
│   ├── perfil.tsx        # Perfil privado
│   ├── propuestas/       # Páginas de propuestas
│   └── usuarios/         # Perfiles públicos
├── docs/                 # Documentación
├── scripts/              # Scripts de utilidad
└── types.ts              # Definiciones TypeScript
```

## 🎯 Funcionalidades por Módulo

### Autenticación
- ✅ Registro con validación de padrón electoral
- ✅ Inicio de sesión seguro
- ✅ Recuperación de contraseña
- ✅ Verificación de email

### Propuestas
- ✅ Crear propuestas con formulario validado
- ✅ Editar propuestas propias
- ✅ Eliminar propuestas (con cascade delete)
- ✅ Votar a favor/en contra (una vez por usuario)
- ✅ Reportar contenido inapropiado

### Perfiles
- ✅ Perfil privado completo
- ✅ Perfiles públicos con navegación
- ✅ Configuración de privacidad
- ✅ Historial de votos y propuestas

### Navegación
- ✅ Links clickeables en todas las tarjetas
- ✅ Nombres de usuarios como links
- ✅ URLs semánticas y SEO-friendly
- ✅ Navegación intuitiva

## 🔧 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build para producción
npm run start        # Inicia servidor de producción
npm run lint         # Ejecuta ESLint
```

## 📊 Base de Datos

La aplicación utiliza **NocoDB** con las siguientes tablas:

- **PadronElectoral**: Datos del padrón electoral
- **UsuarioApp**: Usuarios registrados
- **Propuesta**: Propuestas ciudadanas
- **Voto**: Votos de usuarios en propuestas
- **Reporte**: Reportes de contenido
- **Notificacion**: Sistema de notificaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**Adrián G. M. R.** - *Desarrollo completo*

## 🙏 Agradecimientos

- Comunidad de Next.js por el excelente framework
- NocoDB por la base de datos sin código
- Tailwind CSS por el sistema de estilos
- La comunidad open source

---

**¡Únete a la participación ciudadana con Carpinchos OK!** 🐾✨
