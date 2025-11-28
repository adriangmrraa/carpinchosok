import { z } from 'zod';
import { getUsuarioById, updateUsuario, getPropuestas, getVotosByUsuario } from '../../../../lib/nocodb';
import { verifyJWT } from '../../../../lib/auth';

const updateUsuarioSchema = z.object({
  perfilPrivado: z.boolean().optional(),
  mostrarNombrePublico: z.boolean().optional(),
  mostrarVotosPublicos: z.boolean().optional(),
});

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
    console.log('Fetching user with ID:', usuarioId);
    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) {
      console.log('User not found with ID:', usuarioId);
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    console.log('User found:', usuario);

    // Get propuestas
    const propuestas = await getPropuestas();
    console.log('All proposals from DB:', propuestas.map(p => ({ id: p.id, titulo: p.titulo, autorId: p.autorId })));

    // Convert autorId to number for proper comparison (NocoDB returns strings)
    const misPropuestas = propuestas.filter(p => {
      const autorIdNum = typeof p.autorId === 'string' ? parseInt(p.autorId) : p.autorId;
      return autorIdNum === usuarioId;
    });
    console.log('Filtered proposals for user', usuarioId, ':', misPropuestas.map(p => ({ id: p.id, titulo: p.titulo })));

    // Get votos del usuario con títulos de propuestas
    const misVotos = await getVotosByUsuario(usuarioId);
    const todasLasPropuestas = await getPropuestas();
    console.log('My votes:', misVotos.length);

    // Convert valor to number for proper filtering (NocoDB returns strings)
    const votosPositivos = misVotos
      .filter(v => (typeof v.valor === 'string' ? parseInt(v.valor) : v.valor) === 1)
      .map(voto => {
        // Convert propuestaId to number for comparison (NocoDB returns strings)
        const propuestaIdNum = typeof voto.propuestaId === 'string' ? parseInt(voto.propuestaId) : voto.propuestaId;
        const propuesta = todasLasPropuestas.find(p => p.id === propuestaIdNum);
        return {
          ...voto,
          tituloPropuesta: propuesta?.titulo || 'Propuesta no encontrada',
          descripcionPropuesta: propuesta?.descripcion || '',
        };
      });

    const votosNegativos = misVotos
      .filter(v => (typeof v.valor === 'string' ? parseInt(v.valor) : v.valor) === -1)
      .map(voto => {
        // Convert propuestaId to number for comparison (NocoDB returns strings)
        const propuestaIdNum = typeof voto.propuestaId === 'string' ? parseInt(voto.propuestaId) : voto.propuestaId;
        const propuesta = todasLasPropuestas.find(p => p.id === propuestaIdNum);
        return {
          ...voto,
          tituloPropuesta: propuesta?.titulo || 'Propuesta no encontrada',
          descripcionPropuesta: propuesta?.descripcion || '',
        };
      });

    const { passwordHash, ...publicUser } = usuario;

    // NocoDB now returns actual booleans for checkbox fields
    const convertedUser = {
      ...publicUser,
      emailVerificado: (publicUser as any).emailVerificado,
      perfilPrivado: (publicUser as any).perfilPrivado,
      mostrarNombrePublico: (publicUser as any).mostrarNombrePublico,
      mostrarVotosPublicos: (publicUser as any).mostrarVotosPublicos,
      propuestas: misPropuestas,
      votosPositivos,
      votosNegativos,
    };

    return Response.json(convertedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const body = await request.json();
    const validated = updateUsuarioSchema.parse(body);

    console.log('Updating user:', usuarioId, 'with data:', validated);

    // Get current user data for full update
    const currentUser = await getUsuarioById(usuarioId);
    if (!currentUser) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Prepare FULL update object with all fields (NocoDB requires this for PUT)
    const fullUpdate: any = {
      dni: currentUser.dni,
      padronId: currentUser.padronId,
      email: currentUser.email,
      passwordHash: currentUser.passwordHash,
      emailVerificado: currentUser.emailVerificado,
      perfilPrivado: validated.perfilPrivado !== undefined ? validated.perfilPrivado : currentUser.perfilPrivado,
      mostrarNombrePublico: validated.mostrarNombrePublico !== undefined ? validated.mostrarNombrePublico : currentUser.mostrarNombrePublico,
      mostrarVotosPublicos: validated.mostrarVotosPublicos !== undefined ? validated.mostrarVotosPublicos : currentUser.mostrarVotosPublicos,
      nombreMostrado: currentUser.nombreMostrado,
      ultimaLat: currentUser.ultimaLat,
      ultimaLng: currentUser.ultimaLng,
      createdAt: currentUser.createdAt,
      updatedAt: new Date().toISOString(),
    };

    console.log('Full updates object:', fullUpdate);

    const updated = await updateUsuario(usuarioId, fullUpdate as any);
    const { passwordHash, ...publicUser } = updated;

    // NocoDB checkbox fields are already booleans
    const convertedUser = {
      ...publicUser,
      emailVerificado: (publicUser as any).emailVerificado,
      perfilPrivado: (publicUser as any).perfilPrivado,
      mostrarNombrePublico: (publicUser as any).mostrarNombrePublico,
      mostrarVotosPublicos: (publicUser as any).mostrarVotosPublicos,
    };

    return Response.json(convertedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}