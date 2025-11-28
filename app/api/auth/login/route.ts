import { z } from 'zod';
import { getUsuarioByDniOrEmail } from '../../../../lib/nocodb';
import { verifyPassword, generateJWT } from '../../../../lib/auth';

const loginSchema = z.object({
  dniOrEmail: z.string(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dniOrEmail, password } = loginSchema.parse(body);

    const user = await getUsuarioByDniOrEmail(dniOrEmail);
    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 400 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return Response.json({ error: 'Contraseña incorrecta' }, { status: 400 });
    }

    if (!user.emailVerificado) {
      return Response.json({ error: 'Debes verificar tu email antes de iniciar sesión' }, { status: 403 });
    }

    const token = generateJWT(user);

    // Set cookie
    const response = Response.json({ message: 'Login exitoso' });
    response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800`); // 7 days

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error logging in:', error);
    return Response.json({ error: 'Failed to login' }, { status: 500 });
  }
}