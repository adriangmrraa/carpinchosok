import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useUser } from '../../components/UserContext';

interface Proposal {
  id: number;
  titulo: string;
  descripcion: string;
  autorId: number;
  localidad: string;
  createdAt: string;
  votosPositivos: number;
  votosNegativos: number;
  cantidadReportes: number;
  autorNombre: string;
}

interface Vote {
  id: number;
  usuarioId: number;
  propuestaId: number;
  valor: number;
  createdAt: string;
}

const PropuestaDetalle = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadProposal(id);
    }
  }, [id, user]);

  const loadProposal = async (proposalId: string) => {
    try {
      // Load proposal data
      const res = await fetch(`/api/propuestas/${proposalId}`);
      if (res.ok) {
        const data = await res.json();
        setProposal(data);
      } else if (res.status === 404) {
        setError('Propuesta no encontrada');
      } else {
        setError('Error al cargar la propuesta');
      }

      // Load user's vote if logged in
      if (user) {
        try {
          const voteRes = await fetch('/api/votos', {
            headers: {
              'Cookie': document.cookie,
            },
          });
          if (voteRes.ok) {
            const votes = await voteRes.json();
            const userVoteForProposal = votes.find((v: Vote) =>
              v.propuestaId === parseInt(proposalId) && v.usuarioId === user.id
            );
            setUserVote(userVoteForProposal || null);
          }
        } catch (voteError) {
          console.error('Error loading user vote:', voteError);
        }
      }
    } catch (err) {
      setError('Error al cargar la propuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (valor: 1 | -1) => {
    if (!user || !proposal) return;

    setVoting(true);
    try {
      const res = await fetch(`/api/propuestas/${proposal.id}/votar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        body: JSON.stringify({ valor }),
      });

      if (res.ok) {
        // Reload proposal data
        await loadProposal(proposal.id.toString());
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al votar');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error al votar');
    } finally {
      setVoting(false);
    }
  };

  const handleReport = async () => {
    if (!user || !proposal) return;

    if (!confirm('¿Estás seguro de que quieres reportar esta propuesta?')) return;

    try {
      const res = await fetch(`/api/propuestas/${proposal.id}/reportar`, {
        method: 'POST',
        headers: {
          'Cookie': document.cookie,
        },
      });

      if (res.ok) {
        alert('Propuesta reportada exitosamente');
        await loadProposal(proposal.id.toString());
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al reportar');
      }
    } catch (error) {
      console.error('Error reporting:', error);
      alert('Error al reportar');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !proposal) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-200 bg-red-50">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">
                {error || 'Propuesta no encontrada'}
              </h3>
              <p className="text-red-700 mb-4">
                La propuesta que buscas no existe o no está disponible.
              </p>
              <Button onClick={() => router.push('/')}>
                Volver al inicio
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const canVote = user && !userVote;
  const isAuthor = user && user.id === proposal.autorId;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {proposal.titulo}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Link
                    href={`/usuarios/${proposal.autorId}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Por {proposal.autorNombre}
                  </Link>
                  <span>•</span>
                  <span>{proposal.localidad}</span>
                  <span>•</span>
                  <span>{new Date(proposal.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-700">
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{proposal.descripcion}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{proposal.votosPositivos}</div>
                <div className="text-sm text-gray-600">Votos a favor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{proposal.votosNegativos}</div>
                <div className="text-sm text-gray-600">Votos en contra</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{proposal.cantidadReportes}</div>
                <div className="text-sm text-gray-600">Reportes</div>
              </div>
            </div>

            {/* User Vote Status */}
            {userVote && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-medium">
                    Ya votaste {userVote.valor === 1 ? 'a favor' : 'en contra'} de esta propuesta
                  </span>
                  <span className="text-sm text-gray-600">
                    ({new Date(userVote.createdAt).toLocaleDateString('es-ES')})
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            {user && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  {canVote && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleVote(1)}
                        loading={voting}
                        className="flex items-center space-x-2"
                      >
                        <span>👍</span>
                        <span>Votar a favor</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleVote(-1)}
                        loading={voting}
                        className="flex items-center space-x-2"
                      >
                        <span>👎</span>
                        <span>Votar en contra</span>
                      </Button>
                    </>
                  )}
                  {!canVote && !isAuthor && (
                    <div className="text-gray-600">
                      Ya has votado en esta propuesta
                    </div>
                  )}
                </div>

                {!isAuthor && (
                  <Button
                    variant="secondary"
                    onClick={handleReport}
                  >
                    Reportar
                  </Button>
                )}
              </div>
            )}

            {!user && (
              <div className="text-center py-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Para votar en esta propuesta, necesitas iniciar sesión.
                </p>
                <Button onClick={() => router.push('/login')}>
                  Iniciar sesión
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Back button */}
        <div className="mt-6 text-center">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Volver
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PropuestaDetalle;