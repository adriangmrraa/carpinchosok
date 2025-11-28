import { getUsuarioByDniOrEmail, updateUsuario } from '../../../../lib/nocodb';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token faltante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user by token
    // Since NocoDB doesn't support direct query by token, we need to fetch all and filter (inefficient, but for demo)
    // TODO: In production, use a separate table or better query
    const users = await fetch(`${process.env.NOCODB_BASE_URL}/tables/${process.env.NOCODB_TABLE_ID_USUARIOS}/records`, {
      headers: { 'Authorization': `Bearer ${process.env.NOCODB_API_TOKEN}` },
    }).then(res => res.json()).then(data => data.list);

    const user = users.find((u: any) => u.verificationToken === token && new Date(u.verificationExpires) > new Date());

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update user
    await updateUsuario(user.id, {
      emailVerificado: true,
      verificationToken: undefined,
      verificationExpires: undefined,
    });

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