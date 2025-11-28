import { z } from 'zod';
import { buscarVoto, crearReporte, crearNotificacion } from '../../../../../lib/nocodb';
import { verifyJWT } from '../../../../../lib/auth';

const reportarSchema = z.object({
  motivo: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const propuestaId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { motivo } = reportarSchema.parse(body);

    const usuarioId = payload.usuarioId;

    // TODO: Check if already reported

    // Create report
    await crearReporte({
      usuarioId,
      propuestaId,
      motivo,
      createdAt: new Date().toISOString(),
    });

    // Create notification
    await crearNotificacion({
      usuarioId: propuestaId, // TODO: get autorId
      propuestaId,
      tipo: 'reporte',
      mensaje: 'Tu propuesta recibió un reporte',
      leida: false,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ message: 'Reporte registrado' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error reporting:', error);
    return Response.json({ error: 'Failed to report' }, { status: 500 });
  }
}