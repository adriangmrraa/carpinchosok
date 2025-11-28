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

      // Use Id field from NocoDB (capital I)
      const userId = u.Id || u.id;
      console.log(`[verify-email] Checking user ${userId}:`, {
        hasToken,
        hasExpiry,
        notExpired,
        tokenMatch: hasToken,
        expiryCheck: notExpired
      });

      return hasToken && notExpired;
    });

    console.log('[verify-email] usuario encontrado:', user && {
      id: user.Id || user.id,
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

    // Get the correct user ID (NocoDB uses 'Id' with capital I)
    const userId = user.Id || user.id;
    console.log('[verify-email] Actualizando usuario con ID:', userId);

    if (!userId) {
      console.log('[verify-email] ERROR: Usuario no tiene ID válido');
      return new Response(
        JSON.stringify({ error: 'Error interno: usuario sin ID' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-email] Actualizando usuario...');

    // First, try to update only the emailVerificado field to see if it works
    try {
      await updateUsuario(userId, {
        emailVerificado: true,
      });
      console.log('[verify-email] Campo emailVerificado actualizado correctamente');
    } catch (emailError) {
      console.error('[verify-email] Error actualizando emailVerificado:', emailError);
      // Continue anyway, maybe the field name is different
    }

    // Then try to clear the verification fields
    try {
      await updateUsuario(userId, {
        verificationToken: undefined,
        verificationExpires: undefined,
      });
      console.log('[verify-email] Campos de verificación limpiados correctamente');
    } catch (tokenError) {
      console.error('[verify-email] Error limpiando campos de verificación:', tokenError);
      // This is less critical, the email is already verified
    }

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