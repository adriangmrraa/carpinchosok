import { getNotificacionesByUsuario } from '../../../lib/nocodb';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: Request) {
  try {
    // Auth
    const cookie = request.headers.get('cookie');
    const token = cookie?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyJWT(token);
    if (!payload) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const usuarioId = payload.usuarioId;
    const url = new URL(request.url);
    const soloNoLeidas = url.searchParams.get('soloNoLeidas') === 'true';

    const notificaciones = await getNotificacionesByUsuario(usuarioId, soloNoLeidas);
    return Response.json(notificaciones);
  } catch (error) {
    console.error('Error fetching notificaciones:', error);
    return Response.json({ error: 'Failed to fetch notificaciones' }, { status: 500 });
  }
}