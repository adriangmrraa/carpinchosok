import { z } from 'zod';
import { getPadronByDni, getUsuarioByDniOrEmail, crearUsuarioApp } from '../../../../lib/nocodb';
import { hashPassword, isWithinAllowedArea } from '../../../../lib/auth';
import { sendVerificationEmail } from '../../../../lib/email';
import crypto from 'crypto';

const registerSchema = z.object({
  dni: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  perfilPrivado: z.boolean(),
  mostrarNombrePublico: z.boolean(),
  mostrarVotosPublicos: z.boolean(),
  lat: z.number(),
  lng: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Normalize DNI
    const dni = validated.dni.replace(/\D/g, '');

    // Check geolocation
    if (!isWithinAllowedArea(validated.lat, validated.lng)) {
      return Response.json({ error: 'Ubicación no permitida' }, { status: 400 });
    }

    // Check padron - solo por DNI
    console.log(`Buscando DNI ${dni} en padrón electoral`);
    const padronEntry = await getPadronByDni(dni);
    if (!padronEntry) {
      console.log(`DNI ${dni} no encontrado en padrón electoral`);
      return Response.json({ error: 'DNI no encontrado en padrón electoral' }, { status: 400 });
    }
    console.log('Padron entry found:', padronEntry);

    // Check existing user
    const existingUser = await getUsuarioByDniOrEmail(dni) || await getUsuarioByDniOrEmail(validated.email);
    if (existingUser) {
      return Response.json({ error: 'Usuario ya existe' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Create user
    const nuevoUsuario = {
      dni,
      padronId: padronEntry.id,
      email: validated.email,
      passwordHash,
      emailVerificado: false,
      perfilPrivado: validated.perfilPrivado,
      mostrarNombrePublico: validated.mostrarNombrePublico,
      mostrarVotosPublicos: validated.mostrarVotosPublicos,
      nombreMostrado: `${padronEntry.nombre} ${padronEntry.apellido}`,
      ultimaLat: validated.lat,
      ultimaLng: validated.lng,
      verificationToken,
      verificationExpires,
      createdAt: new Date().toISOString(),
    };

    const usuario = await crearUsuarioApp(nuevoUsuario);

    // Send verification email
    sendVerificationEmail(validated.email, verificationToken);

    // Return public data
    const { passwordHash: _, ...publicUser } = usuario;
    return Response.json(publicUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error registering user:', error);
    return Response.json({ error: 'Failed to register' }, { status: 500 });
  }
}