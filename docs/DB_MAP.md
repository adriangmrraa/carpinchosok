# Schema de Base de Datos NocoDB

## Tablas

### PadronElectoral
- **TABLEID**: NOCODB_TABLE_ID_PADRON
- **Campos**:
  - id: Número, PK, autonumérico
  - dni: Texto
  - apellido: Texto
  - nombre: Texto
  - localidad: Texto

### Usuarios (UsuarioApp)
- **TABLEID**: NOCODB_TABLE_ID_USUARIOS
- **Campos**:
  - id: Número, PK, autonumérico
  - dni: Texto
  - padronId: Enlace a PadronElectoral
  - email: Texto
  - passwordHash: Texto largo
  - emailVerificado: Checkbox, default false
  - perfilPrivado: Checkbox, default false
  - mostrarNombrePublico: Checkbox, default true
  - mostrarVotosPublicos: Checkbox, default true
  - nombreMostrado: Texto
  - ultimaLat: Número decimal
  - ultimaLng: Número decimal
  - verificationToken: Texto largo, opcional
  - verificationExpires: Fecha/Hora, opcional
  - createdAt: Fecha/Hora
  - updatedAt: Fecha/Hora, opcional

### Propuestas
- **TABLEID**: NOCODB_TABLE_ID_PROPUESTAS
- **Campos**:
  - id: Número, PK, autonumérico
  - titulo: Texto
  - descripcion: Texto largo
  - autorId: Enlace a Usuarios
  - localidad: Texto
  - createdAt: Fecha/Hora
  - updatedAt: Fecha/Hora, opcional

### Votos
- **TABLEID**: NOCODB_TABLE_ID_VOTOS
- **Campos**:
  - id: Número, PK, autonumérico
  - usuarioId: Enlace a Usuarios
  - propuestaId: Enlace a Propuestas
  - valor: Número (1 o -1)
  - createdAt: Fecha/Hora

### Reportes
- **TABLEID**: NOCODB_TABLE_ID_REPORTES
- **Campos**:
  - id: Número, PK, autonumérico
  - usuarioId: Enlace a Usuarios
  - propuestaId: Enlace a Propuestas
  - motivo: Texto, opcional
  - createdAt: Fecha/Hora

### Notificaciones
- **TABLEID**: NOCODB_TABLE_ID_NOTIFICACIONES
- **Campos**:
  - id: Número, PK, autonumérico
  - usuarioId: Enlace a Usuarios
  - propuestaId: Enlace a Propuestas, opcional
  - tipo: Texto ("voto_positivo", "voto_negativo", "reporte")
  - mensaje: Texto
  - leida: Checkbox, default false
  - createdAt: Fecha/Hora

## Constraints
- Votos: UNIQUE (usuarioId, propuestaId)
- Reportes: UNIQUE (usuarioId, propuestaId)
- Usuarios: UNIQUE dni, email (implementado en app)