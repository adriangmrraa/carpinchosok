import { z } from 'zod';
import { updatePropuesta, deletePropuesta, getPropuestaById, getVotosPositivos, getVotosNegativos, getCantidadReportes, getUsuarioNombreById } from '../../../../lib/nocodb';
import { verifyJWT } from '../../../../lib/auth';

const updatePropuestaSchema = z.object({
  titulo: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const propuestaId = parseInt(resolvedParams.id);

    const propuesta = await getPropuestaById(propuestaId);
    if (!propuesta) {
      return Response.json({ error: 'Propuesta no encontrada' }, { status: 404 });
    }

    // Add vote counts
    const votosPositivos = await getVotosPositivos(propuestaId);
    const votosNegativos = await getVotosNegativos(propuestaId);
    const cantidadReportes = await getCantidadReportes(propuestaId);

    // Get author name
    const autorId = typeof propuesta.autorId === 'string' ? parseInt(propuesta.autorId) : propuesta.autorId;
    const autorNombre = await getUsuarioNombreById(autorId);

    const enrichedPropuesta = {
      ...propuesta,
      votosPositivos,
      votosNegativos,
      cantidadReportes,
      autorNombre,
    };

    return Response.json(enrichedPropuesta);
  } catch (error) {
    console.error('Error fetching propuesta:', error);
    return Response.json({ error: 'Failed to fetch propuesta' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const validated = updatePropuestaSchema.parse(body);

    // Get the proposal to check ownership
    const existingPropuesta = await getPropuestaById(propuestaId);
    if (!existingPropuesta) {
      return Response.json({ error: 'Propuesta no encontrada' }, { status: 404 });
    }

    // Check ownership (convert both to numbers for comparison)
    const autorIdNum = typeof existingPropuesta.autorId === 'string' ? parseInt(existingPropuesta.autorId) : existingPropuesta.autorId;
    if (autorIdNum !== payload.usuarioId) {
      return Response.json({ error: 'No tienes permiso para editar esta propuesta' }, { status: 403 });
    }

    const updateData = {
      ...validated,
      updatedAt: new Date().toISOString(),
    };

    const propuesta = await updatePropuesta(propuestaId, updateData);
    return Response.json(propuesta);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error updating propuesta:', error);
    return Response.json({ error: 'Failed to update propuesta' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Get the proposal to check ownership
    const propuesta = await getPropuestaById(propuestaId);
    if (!propuesta) {
      return Response.json({ error: 'Propuesta no encontrada' }, { status: 404 });
    }

    // Check ownership (convert both to numbers for comparison)
    const autorIdNum = typeof propuesta.autorId === 'string' ? parseInt(propuesta.autorId) : propuesta.autorId;
    if (autorIdNum !== payload.usuarioId) {
      return Response.json({ error: 'No tienes permiso para eliminar esta propuesta' }, { status: 403 });
    }

    await deletePropuesta(propuestaId);
    return Response.json({ message: 'Propuesta eliminada' });
  } catch (error) {
    console.error('Error deleting propuesta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: 'Failed to delete propuesta', details: errorMessage }, { status: 500 });
  }
}