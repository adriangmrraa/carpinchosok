import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

interface EnrichedProposal {
  id: number;
  titulo: string;
  descripcion: string;
  autorId: number;
  localidad: string;
  createdAt: string;
  updatedAt?: string;
  votosPositivos: number;
  votosNegativos: number;
  cantidadReportes: number;
  autorNombre: string;
}

interface User {
  id: number;
  dni: string;
  nombreMostrado: string;
  perfilPrivado: boolean;
  mostrarNombrePublico: boolean;
  mostrarVotosPublicos: boolean;
  localidad?: string;
}

export default function Home() {
  const [proposals, setProposals] = useState<EnrichedProposal[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({ titulo: '', descripcion: '', localidad: 'Buenos Aires' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProposals();
    fetchUser();
  }, []);

  const fetchProposals = async () => {
    setProposalsLoading(true);
    try {
      const response = await fetch('/api/propuestas');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
        setError('');
      } else {
        setError('Error al cargar las propuestas');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError('Error al cargar las propuestas');
    } finally {
      setProposalsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      // First check if authenticated
      const authRes = await fetch('/api/auth/me');
      if (authRes.ok) {
        // Then get full user data
        const userRes = await fetch('/api/usuarios/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('Feed page user data:', userData);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.titulo.trim() || !newProposal.descripcion.trim() || !newProposal.localidad.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/propuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: newProposal.titulo.trim(),
          descripcion: newProposal.descripcion.trim(),
          localidad: newProposal.localidad.trim(),
        }),
      });

      if (response.ok) {
        setNewProposal({ titulo: '', descripcion: '', localidad: 'Buenos Aires' });
        setShowCreateForm(false);
        await fetchProposals();
        // Show success message
        alert('¡Propuesta publicada exitosamente!');
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear la propuesta');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError('Error al crear la propuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (proposalId: number, valor: 1 | -1) => {
    try {
      const response = await fetch(`/api/propuestas/${proposalId}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor }),
      });

      if (response.ok) {
        // Refresh proposals to update counters
        await fetchProposals();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al votar');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error al votar');
    }
  };

  const handleReport = async (proposalId: number) => {
    try {
      const response = await fetch(`/api/propuestas/${proposalId}/reportar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        alert('Propuesta reportada');
      } else {
        const data = await response.json();
        alert(data.error || 'Error al reportar');
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Propuestas Ciudadanas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Leé, votá y proponé ideas para mejorar tu comunidad. Tu voz cuenta.
          </p>
        </div>

        {/* Create Proposal Section */}
        {user ? (
          <Card className="mb-8 shadow-lg">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {user.nombreMostrado ? user.nombreMostrado.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    ¿Qué propuesta tenés para tu comunidad?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Compartí tus ideas para mejorar {user.localidad || 'tu localidad'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-4">
                <Input
                  label="Título de la propuesta"
                  value={newProposal.titulo}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Escribe un título claro y conciso..."
                  maxLength={100}
                  required
                />

                <Input
                  label="Localidad"
                  value={newProposal.localidad}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, localidad: e.target.value }))}
                  placeholder="Ej: Buenos Aires, Córdoba, Rosario..."
                  maxLength={50}
                  required
                />

                <Textarea
                  label="Descripción detallada"
                  value={newProposal.descripcion}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe tu propuesta con detalle. ¿Qué problema soluciona? ¿Cómo se implementaría?"
                  rows={4}
                  maxLength={1000}
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setNewProposal({ titulo: '', descripcion: '', localidad: 'Buenos Aires' });
                      setError('');
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!newProposal.titulo.trim() || !newProposal.descripcion.trim() || !newProposal.localidad.trim()}
                  >
                    Publicar propuesta
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        ) : (
          <Card className="mb-8 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                ¿Querés crear una propuesta?
              </h3>
              <p className="text-blue-700 mb-6 max-w-md mx-auto">
                Iniciá sesión para compartir tus ideas con la comunidad y participar en las decisiones que afectan tu barrio.
              </p>
              <Link href="/login">
                <Button className="shadow-md hover:shadow-lg transition-shadow">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Proposals Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Propuestas de la comunidad
          </h2>

          {/* Loading State */}
          {proposalsLoading && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !proposalsLoading && (
            <Card className="border-red-200 bg-red-50">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Error al cargar propuestas
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  onClick={fetchProposals}
                  variant="secondary"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Intentar nuevamente
                </Button>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!proposalsLoading && !error && proposals.length === 0 && (
            <Card className="border-dashed border-2 border-gray-300">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💭</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  No hay propuestas aún
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Sé el primero en proponer una idea para mejorar tu comunidad.
                  Tu iniciativa puede marcar la diferencia.
                </p>
                {user && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    Crear primera propuesta
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Proposals List */}
          {!proposalsLoading && !error && proposals.length > 0 && (
            <div className="space-y-6">
              {proposals.map((proposal, index) => (
                <Card
                  key={proposal.id}
                  className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {proposal.titulo}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 space-x-2">
                        <Link
                          href={`/usuarios/${proposal.autorId}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {proposal.autorNombre}
                        </Link>
                        <span>•</span>
                        <span>{proposal.localidad}</span>
                        <span>•</span>
                        <span>{new Date(proposal.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-gray-700 mb-6 leading-relaxed">
                      <p className="whitespace-pre-wrap">{proposal.descripcion}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-green-600">
                          <span className="text-lg">👍</span>
                          <span className="font-semibold">{proposal.votosPositivos}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-red-600">
                          <span className="text-lg">👎</span>
                          <span className="font-semibold">{proposal.votosNegativos}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-orange-600">
                          <span className="text-lg">🚩</span>
                          <span className="font-semibold">{proposal.cantidadReportes}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Desktop */}
                      <div className="hidden md:flex items-center space-x-3">
                        <Button
                          onClick={() => handleVote(proposal.id, 1)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                        >
                          <span>👍</span>
                          <span>A favor</span>
                        </Button>
                        <Button
                          onClick={() => handleVote(proposal.id, -1)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                        >
                          <span>👎</span>
                          <span>En contra</span>
                        </Button>
                        <Button
                          onClick={() => handleReport(proposal.id)}
                          variant="secondary"
                          size="sm"
                          className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
                        >
                          Reportar
                        </Button>
                      </div>

                      {/* Action Buttons - Mobile */}
                      <div className="md:hidden w-full">
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => handleVote(proposal.id, 1)}
                            variant="secondary"
                            size="sm"
                            className="flex items-center justify-center space-x-2 w-full hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                          >
                            <span>👍</span>
                            <span>A favor</span>
                          </Button>
                          <Button
                            onClick={() => handleVote(proposal.id, -1)}
                            variant="secondary"
                            size="sm"
                            className="flex items-center justify-center space-x-2 w-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                          >
                            <span>👎</span>
                            <span>En contra</span>
                          </Button>
                          <Button
                            onClick={() => handleReport(proposal.id)}
                            variant="secondary"
                            size="sm"
                            className="w-full hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
                          >
                            Reportar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Author Actions */}
                    {user && user.id === proposal.autorId && (
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            alert('Funcionalidad de edición próximamente');
                          }}
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) {
                              // TODO: Implement delete functionality
                              alert('Funcionalidad de eliminación próximamente');
                            }
                          }}
                        >
                          🗑️ Eliminar
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}