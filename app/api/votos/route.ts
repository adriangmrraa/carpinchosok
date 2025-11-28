import { z } from 'zod';
import { createVoto } from '../../../lib/nocodb';

const createVotoSchema = z.object({
  usuarioId: z.number(),
  propuestaId: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuarioId, propuestaId } = createVotoSchema.parse(body);

    // Check for duplicate vote
    const checkUrl = `${process.env.NOCODB_BASE_URL}/tables/${process.env.NOCODB_TABLE_ID_VOTOS}/records?where=(usuarioId,eq,${usuarioId})~and(propuestaId,eq,${propuestaId})`;
    const checkRes = await fetch(checkUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NOCODB_API_TOKEN}`,
      },
    });
    if (!checkRes.ok) {
      throw new Error('Failed to check existing votes');
    }
    const checkData = await checkRes.json();
    if (checkData.list && checkData.list.length > 0) {
      return Response.json({ error: 'Voto duplicado no permitido' }, { status: 400 });
    }

    // Create the vote
    const nuevoVoto = {
      usuarioId,
      propuestaId,
      valor: 1 as 1 | -1, // TODO: get from body
      createdAt: new Date().toISOString(),
    };
    const voto = await createVoto(nuevoVoto);
    return Response.json({ mensaje: 'Voto registrado', voto }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error registering vote:', error);
    return Response.json({ error: 'Failed to register vote' }, { status: 500 });
  }
}