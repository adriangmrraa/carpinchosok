import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface PublicUserProfile {
  id: number;
  nombreMostrado: string;
  perfilPrivado: boolean;
  mostrarNombrePublico: boolean;
  mostrarVotosPublicos: boolean;
  propuestas?: any[];
  votosPositivos?: any[];
  votosNegativos?: any[];
  createdAt: string;
}

const UsuarioPerfil = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadUserProfile(id);
    }
  }, [id]);

  const loadUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 404) {
        setError('Usuario no encontrado');
      } else {
        setError('Error al cargar el perfil');
      }
    } catch (err) {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
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

  if (error || !user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-200 bg-red-50">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">
                {error || 'Perfil no encontrado'}
              </h3>
              <p className="text-red-700 mb-4">
                El usuario que buscas no existe o no está disponible.
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

  const displayName = user.mostrarNombrePublico ? user.nombreMostrado : 'Usuario anónimo';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              {user.perfilPrivado && (
                <p className="text-gray-600">Perfil privado</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Miembro desde {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600">{user.propuestas?.length || 0}</div>
                <div className="text-sm text-gray-600">Propuestas</div>
              </div>
            </Card>
            {user.mostrarVotosPublicos && !user.perfilPrivado && (
              <>
                <Card className="text-center">
                  <div className="p-4">
                    <div className="text-2xl font-bold text-green-600">{user.votosPositivos?.length || 0}</div>
                    <div className="text-sm text-gray-600">Votos positivos</div>
                  </div>
                </Card>
                <Card className="text-center">
                  <div className="p-4">
                    <div className="text-2xl font-bold text-red-600">{user.votosNegativos?.length || 0}</div>
                    <div className="text-sm text-gray-600">Votos negativos</div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Propuestas */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Propuestas</h3>
              {user.propuestas && user.propuestas.length > 0 ? (
                <div className="space-y-4">
                  {user.propuestas.map((propuesta: any, index: number) => (
                    <Link
                      key={propuesta.id}
                      href={`/propuestas/${propuesta.id}`}
                      className="block"
                    >
                      <div
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards',
                          opacity: 0
                        }}
                      >
                        <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">{propuesta.titulo}</h4>
                        <p className="text-gray-700 mb-3 line-clamp-3">{propuesta.descripcion}</p>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>👍 {propuesta.votosPositivos || 0}</span>
                            <span>👎 {propuesta.votosNegativos || 0}</span>
                            <span>🚩 {propuesta.cantidadReportes || 0}</span>
                          </div>
                          <span>{new Date(propuesta.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">💡</span>
                  <p className="text-gray-600 mt-2">
                    {user.perfilPrivado ? 'Este usuario tiene el perfil privado' : 'Este usuario aún no ha creado propuestas'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Votos Públicos */}
          {user.mostrarVotosPublicos && !user.perfilPrivado && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-green-600 mr-2">👍</span>
                    Votos Positivos
                  </h3>
                  {user.votosPositivos && user.votosPositivos.length > 0 ? (
                    <div className="space-y-3">
                      {user.votosPositivos.map((voto: any) => (
                        <div key={voto.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <Link
                            href={`/propuestas/${voto.propuestaId}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            {voto.tituloPropuesta}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {new Date(voto.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No ha votado positivo en ninguna propuesta</p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-red-600 mr-2">👎</span>
                    Votos Negativos
                  </h3>
                  {user.votosNegativos && user.votosNegativos.length > 0 ? (
                    <div className="space-y-3">
                      {user.votosNegativos.map((voto: any) => (
                        <div key={voto.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <Link
                            href={`/propuestas/${voto.propuestaId}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            {voto.tituloPropuesta}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {new Date(voto.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No ha votado negativo en ninguna propuesta</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Mensaje de privacidad */}
          {user.perfilPrivado && (
            <Card className="border-blue-200 bg-blue-50">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-xl">🔒</span>
                </div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Perfil Privado
                </h3>
                <p className="text-blue-700">
                  Este usuario ha configurado su perfil como privado. Solo puede ver sus propuestas públicas.
                </p>
              </div>
            </Card>
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
};

export default UsuarioPerfil;