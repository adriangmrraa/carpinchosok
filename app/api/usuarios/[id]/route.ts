import { getUsuarioById, getPropuestas, getVotosByUsuario, getVotosPositivos, getVotosNegativos, getCantidadReportes } from '../../../../lib/nocodb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    // Get user data
    const user = await getUsuarioById(userId);
    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Get user's proposals
    const allPropuestas = await getPropuestas();
    const userProposals = allPropuestas.filter(p => {
      const autorId = typeof p.autorId === 'string' ? parseInt(p.autorId) : p.autorId;
      return autorId === userId;
    });

    // Add vote counts to proposals
    const enrichedProposals = await Promise.all(
      userProposals.map(async (propuesta) => {
        const votosPositivos = await getVotosPositivos(propuesta.id);
        const votosNegativos = await getVotosNegativos(propuesta.id);
        const cantidadReportes = await getCantidadReportes(propuesta.id);

        return {
          ...propuesta,
          votosPositivos,
          votosNegativos,
          cantidadReportes,
        };
      })
    );

    // Build response based on privacy settings
    const publicProfile: any = {
      id: user.id,
      nombreMostrado: user.mostrarNombrePublico ? user.nombreMostrado : 'Usuario anónimo',
      perfilPrivado: user.perfilPrivado,
      mostrarNombrePublico: user.mostrarNombrePublico,
      mostrarVotosPublicos: user.mostrarVotosPublicos,
      createdAt: user.createdAt,
      propuestas: enrichedProposals,
    };

    // Add votes data only if profile is not private and user allows showing votes
    if (!user.perfilPrivado && user.mostrarVotosPublicos) {
      const userVotes = await getVotosByUsuario(userId);

      // Separate positive and negative votes
      const votosPositivos = [];
      const votosNegativos = [];

      for (const vote of userVotes) {
        // Convert valor to number if it's a string
        const valor = typeof vote.valor === 'string' ? parseInt(vote.valor) : vote.valor;

        // Find the proposal title for this vote
        const proposal = allPropuestas.find(p => {
          const propId = typeof p.id === 'string' ? parseInt(p.id) : p.id;
          const votePropId = typeof vote.propuestaId === 'string' ? parseInt(vote.propuestaId) : vote.propuestaId;
          return propId === votePropId;
        });

        // Skip votes for proposals that no longer exist
        if (!proposal) continue;

        const voteData = {
          id: vote.id,
          propuestaId: vote.propuestaId,
          tituloPropuesta: proposal.titulo,
          createdAt: vote.createdAt,
        };

        if (valor === 1) {
          votosPositivos.push(voteData);
        } else if (valor === -1) {
          votosNegativos.push(voteData);
        }
      }

      publicProfile.votosPositivos = votosPositivos;
      publicProfile.votosNegativos = votosNegativos;
    }

    return Response.json(publicProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return Response.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}