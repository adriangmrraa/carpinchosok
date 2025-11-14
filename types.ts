export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Propuesta {
  id: number;
  titulo: string;
  descripcion: string;
  autorId: number;
  fechaCreacion: string; // ISO string format
}

export interface Voto {
  id: number;
  usuarioId: number;
  propuestaId: number;
  fecha: string; // ISO string format
}