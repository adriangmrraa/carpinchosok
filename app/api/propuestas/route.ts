import { z } from 'zod';
import { getPropuestas, createPropuesta, getVotosPositivos, getVotosNegativos, getCantidadReportes, getUsuarioById } from '../../../lib/nocodb';
import { verifyJWT } from '../../../lib/auth';

const createPropuestaSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
});

export async function GET() {
  try {
    const propuestas = await getPropuestas();
    const enriched = await Promise.all(propuestas.map(async (p) => {
      const [votosPositivos, votosNegativos, cantidadReportes] = await Promise.all([
        getVotosPositivos(p.id),
        getVotosNegativos(p.id),
        getCantidadReportes(p.id),
      ]);
      // Convert autorId to number for getUsuarioById
      const autorIdNum = typeof p.autorId === 'string' ? parseInt(p.autorId) : p.autorId;
      const autor = await getUsuarioById(autorIdNum);
      let autorNombre = 'Usuario anónimo';
      if (autor && !autor.perfilPrivado && autor.mostrarNombrePublico) {
        autorNombre = autor.nombreMostrado;
      }
      return {
        ...p,
        votosPositivos,
        votosNegativos,
        cantidadReportes,
        autorNombre,
      };
    }));
    return Response.json(enriched);
  } catch (error) {
    console.error('Error fetching propuestas:', error);
    return Response.json({ error: 'Failed to fetch propuestas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const validated = createPropuestaSchema.parse(body);
    const nuevaPropuesta = {
      titulo: validated.titulo,
      descripcion: validated.descripcion,
      autorId: payload.usuarioId,
      localidad: 'default_localidad', // TODO: get from user
      createdAt: new Date().toISOString(),
    };
    const propuesta = await createPropuesta(nuevaPropuesta);
    return Response.json(propuesta, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error creating propuesta:', error);
    return Response.json({ error: 'Failed to create propuesta' }, { status: 500 });
  }
}