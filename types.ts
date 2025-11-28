export interface PadronElectoral {
  id: number;
  dni: string;
  apellido: string;
  nombre: string;
  localidad: string;
}

export interface UsuarioApp {
  id: number;
  dni: string;
  padronId: number;
  email: string;
  passwordHash: string;
  emailVerificado: boolean;
  perfilPrivado: boolean;
  mostrarNombrePublico: boolean;
  mostrarVotosPublicos: boolean;
  nombreMostrado: string;
  ultimaLat?: number;
  ultimaLng?: number;
  verificationToken?: string;
  verificationExpires?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Propuesta {
  id: number;
  titulo: string;
  descripcion: string;
  autorId: number;
  localidad: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Voto {
  id: number;
  usuarioId: number;
  propuestaId: number;
  valor: 1 | -1;
  createdAt: string;
}

export interface Reporte {
  id: number;
  usuarioId: number;
  propuestaId: number;
  motivo?: string;
  createdAt: string;
}

export interface Notificacion {
  id: number;
  usuarioId: number;
  propuestaId?: number;
  tipo: "voto_positivo" | "voto_negativo" | "reporte";
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

// Legacy interfaces for compatibility
export interface Usuario extends UsuarioApp {}