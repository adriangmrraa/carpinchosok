import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioApp } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'; // TODO: set in env

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJWT(user: UsuarioApp): string {
  return jwt.sign(
    {
      usuarioId: user.id,
      dni: user.dni,
      perfilPrivado: user.perfilPrivado,
      mostrarNombrePublico: user.mostrarNombrePublico,
      mostrarVotosPublicos: user.mostrarVotosPublicos,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function isWithinAllowedArea(lat: number, lng: number): boolean {
  // TEMPORALMENTE DESHABILITADO PARA PRUEBAS
  // TODO: Re-habilitar validación geográfica en producción
  return true;

  /*
  // Código original de validación geográfica
  const centerLat = parseFloat(process.env.GEO_CENTER_LAT || '-34.6037');
  const centerLng = parseFloat(process.env.GEO_CENTER_LNG || '-58.3816');
  const radiusKm = parseFloat(process.env.GEO_RADIUS_KM || '50');

  // Haversine formula to calculate distance
  const R = 6371; // Earth's radius in km
  const dLat = (lat - centerLat) * Math.PI / 180;
  const dLng = (lng - centerLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(centerLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusKm;
  */
}

export function sendVerificationEmail(email: string, token: string): void {
  // TODO: Implement email sending
  console.log(`Send verification email to ${email} with token ${token}`);
}