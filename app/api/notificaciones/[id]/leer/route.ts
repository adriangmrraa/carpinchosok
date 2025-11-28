import { updateNotificacionLeida } from '../../../../../lib/nocodb';
import { verifyJWT } from '../../../../../lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const notificacionId = parseInt(params.id);

    // Check ownership
    const notificaciones = await fetch(`${process.env.NOCODB_BASE_URL}/tables/${process.env.NOCODB_TABLE_ID_NOTIFICACIONES}/records`, {
      headers: { 'Authorization': `Bearer ${process.env.NOCODB_API_TOKEN}` },
    }).then(res => res.json()).then(data => data.list);

    const notificacion = notificaciones.find((n: any) => n.id === notificacionId);
    if (!notificacion) {
      return Response.json({ error: 'Notificación no encontrada' }, { status: 404 });
    }
    if (notificacion.usuarioId !== payload.usuarioId) {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    await updateNotificacionLeida(notificacionId);
    return Response.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error updating notificacion:', error);
    return Response.json({ error: 'Failed to update notificacion' }, { status: 500 });
  }
}