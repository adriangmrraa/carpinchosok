import { z } from 'zod';
import { getUsuarioByDniOrEmail, updateUsuario } from '../../../../lib/nocodb';

const verifySchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = verifySchema.parse(body);

    // Find user by token
    // Since NocoDB doesn't support direct query by token, we need to fetch all and filter (inefficient, but for demo)
    // TODO: In production, use a separate table or better query
    const users = await fetch(`${process.env.NOCODB_BASE_URL}/tables/${process.env.NOCODB_TABLE_ID_USUARIOS}/records`, {
      headers: { 'Authorization': `Bearer ${process.env.NOCODB_API_TOKEN}` },
    }).then(res => res.json()).then(data => data.list);

    const user = users.find((u: any) => u.verificationToken === token && new Date(u.verificationExpires) > new Date());

    if (!user) {
      return Response.json({ error: 'Token inválido o expirado' }, { status: 400 });
    }

    // Update user
    await updateUsuario(user.id, {
      emailVerificado: true,
      verificationToken: undefined,
      verificationExpires: undefined,
    });

    return Response.json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error verifying email:', error);
    return Response.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}