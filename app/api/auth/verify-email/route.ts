import { updateUsuario } from '../../../../lib/nocodb';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    console.log('[verify-email] ======= INICIO VERIFICACIÓN =======');
    console.log('[verify-email] token recibido:', token);
    console.log('[verify-email] token length:', token?.length);

    if (!token) {
      console.log('[verify-email] ERROR: Token faltante');
      return new Response(
        JSON.stringify({ error: 'Token faltante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user by token - using the same approach as other endpoints
    console.log('[verify-email] Consultando usuarios en NocoDB...');
    const res = await fetch(`${process.env.NOCODB_BASE_URL}/api/v2/tables/${process.env.NOCODB_TABLE_ID_USUARIOS}/records`, {
      headers: {
        'xc-token': process.env.NOCODB_API_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    console.log('[verify-email] Respuesta NocoDB status:', res.status);

    if (!res.ok) {
      console.error('[verify-email] Error NocoDB status:', res.status);
      const errorText = await res.text();
      console.error('[verify-email] Error NocoDB response:', errorText);
      return new Response(
        JSON.stringify({ error: 'Error al consultar usuarios' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    console.log('[verify-email] Data received from NocoDB:', { hasList: !!data.list, listLength: data.list?.length });

    const users = Array.isArray(data.list) ? data.list : data;
    console.log('[verify-email] Total users found:', users.length);

    // Debug: show all users with verification tokens
    const usersWithTokens = users.filter((u: any) => u.verificationToken);
    console.log('[verify-email] Users with verification tokens:', usersWithTokens.length);
    usersWithTokens.forEach((u: any, index: number) => {
      console.log(`[verify-email] User ${index + 1}:`, {
        id: u.id,
        email: u.email,
        token: u.verificationToken?.substring(0, 10) + '...',
        expires: u.verificationExpires,
        expired: u.verificationExpires ? new Date(u.verificationExpires) < new Date() : 'no expiry'
      });
    });

    const now = new Date();
    console.log('[verify-email] Current time:', now.toISOString());

    const user = users.find((u: any) => {
      const hasToken = u.verificationToken === token;
      const hasExpiry = !!u.verificationExpires;
      const notExpired = hasExpiry && new Date(u.verificationExpires) > now;

      console.log(`[verify-email] Checking user ${u.id}:`, {
        hasToken,
        hasExpiry,
        notExpired,
        tokenMatch: hasToken,
        expiryCheck: notExpired
      });

      return hasToken && notExpired;
    });

    console.log('[verify-email] usuario encontrado:', user && {
      id: user.id,
      email: user.email,
      emailVerificado: user.emailVerificado,
      token: user.verificationToken?.substring(0, 10) + '...',
      expires: user.verificationExpires
    });

    if (!user) {
      console.log('[verify-email] ERROR: Token inválido o expirado');
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-email] Actualizando usuario...');

    // Update user using the existing helper (which uses API v1)
    await updateUsuario(user.id, {
      emailVerificado: true,
      verificationToken: undefined,
      verificationExpires: undefined,
    });

    console.log('[verify-email] usuario actualizado exitosamente');
    console.log('[verify-email] ======= FIN VERIFICACIÓN =======');

    return new Response(
      JSON.stringify({ message: 'Email verificado exitosamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[verify-email] ERROR INTERNO:', error);
    console.error('[verify-email] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ error: 'Error interno al verificar email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}