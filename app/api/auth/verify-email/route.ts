import { updateUsuario } from '../../../../lib/nocodb';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token faltante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-email] token recibido:', token);

    // Find user by token - using the same approach as other endpoints
    const res = await fetch(`${process.env.NOCODB_BASE_URL}/api/v2/tables/${process.env.NOCODB_TABLE_ID_USUARIOS}/records`, {
      headers: {
        'xc-token': process.env.NOCODB_API_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('[verify-email] Error NocoDB status:', res.status);
      return new Response(
        JSON.stringify({ error: 'Error al consultar usuarios' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    const users = Array.isArray(data.list) ? data.list : data;

    const user = users.find((u: any) =>
      u.verificationToken === token &&
      u.verificationExpires &&
      new Date(u.verificationExpires) > new Date()
    );

    console.log('[verify-email] usuario encontrado:', user && { id: user.id, email: user.email, emailVerificado: user.emailVerificado });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update user using the existing helper (which uses API v1)
    await updateUsuario(user.id, {
      emailVerificado: true,
      verificationToken: undefined,
      verificationExpires: undefined,
    });

    console.log('[verify-email] usuario actualizado exitosamente');

    return new Response(
      JSON.stringify({ message: 'Email verificado exitosamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en verify-email:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno al verificar email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}