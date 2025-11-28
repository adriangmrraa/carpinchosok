'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CreateProposalForm from '../components/CreateProposalForm';
import EditProposalModal from '../components/EditProposalModal';
import { useUser } from '../components/UserContext';

interface ExtendedUser {
  id: number;
  dni: string;
  nombreMostrado: string;
  perfilPrivado: boolean;
  mostrarNombrePublico: boolean;
  mostrarVotosPublicos: boolean;
  email: string;
  emailVerificado: boolean;
  ultimaLat?: number;
  ultimaLng?: number;
  createdAt: string;
  propuestas?: any[];
  votosPositivos?: any[];
  votosNegativos?: any[];
}

interface Notification {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

const Perfil = () => {
  const { user: basicUser, refreshUser } = useUser();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'votes' | 'notifications' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>('');

  // Settings state
  const [settings, setSettings] = useState({
    perfilPrivado: false,
    mostrarNombrePublico: true,
    mostrarVotosPublicos: true,
  });

  // Modal state
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);

  useEffect(() => {
    if (basicUser) {
      loadExtendedUserData();
      loadNotifications();
    }
  }, [basicUser]);

  const loadExtendedUserData = async () => {
    try {
      const res = await fetch('/api/usuarios/me');
      if (res.ok) {
        const data = await res.json();
        setExtendedUser(data);
        setSettings({
          perfilPrivado: data.perfilPrivado,
          mostrarNombrePublico: data.mostrarNombrePublico,
          mostrarVotosPublicos: data.mostrarVotosPublicos,
        });
      } else {
        setError('Error al cargar datos del usuario');
      }
    } catch (err) {
      setError('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notificaciones');
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const updateSettings = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/usuarios/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        // Reload all extended user data to get updated settings + proposals/votes
        await loadExtendedUserData();
        refreshUser(); // Refresh basic user data too
        alert('Configuración actualizada exitosamente');
      } else {
        alert('Error al actualizar configuración');
      }
    } catch (err) {
      alert('Error al actualizar configuración');
    } finally {
      setUpdating(false);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}/leer`, { method: 'POST' });
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleEditPropuesta = (propuesta: any) => {
    setEditingProposal(propuesta);
  };

  const handleSaveEditedProposal = async (titulo: string, descripcion: string) => {
    if (!editingProposal) return;

    try {
      const response = await fetch(`/api/propuestas/${editingProposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descripcion,
        }),
      });

      if (response.ok) {
        alert('Propuesta actualizada exitosamente');
        loadExtendedUserData(); // Reload user data
        setEditingProposal(null);
      } else {
        throw new Error('Error al actualizar la propuesta');
      }
    } catch (err) {
      console.error('Error updating proposal:', err);
      alert('Error al actualizar la propuesta');
      throw err; // Re-throw to let modal handle it
    }
  };

  const handleDeletePropuesta = async (propuestaId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/propuestas/${propuestaId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Propuesta eliminada exitosamente');
          loadExtendedUserData(); // Reload user data
        } else {
          alert('Error al eliminar la propuesta');
        }
      } catch (err) {
        console.error('Error deleting proposal:', err);
        alert('Error al eliminar la propuesta');
      }
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

  if (error || !extendedUser) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-200 bg-red-50">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error al cargar el perfil
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Intentar nuevamente
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'proposals', label: 'Mis Propuestas', icon: '💡' },
    { id: 'votes', label: 'Mis Votos', icon: '🗳️' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {extendedUser.nombreMostrado ? extendedUser.nombreMostrado.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{extendedUser.nombreMostrado || 'Usuario'}</h1>
              <p className="text-gray-600">{extendedUser.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  extendedUser.emailVerificado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {extendedUser.emailVerificado ? '✅ Email verificado' : '⚠️ Email no verificado'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  extendedUser.perfilPrivado ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {extendedUser.perfilPrivado ? '🔒 Perfil privado' : '🌐 Perfil público'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600">{extendedUser.propuestas?.length || 0}</div>
                <div className="text-sm text-gray-600">Propuestas</div>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">{extendedUser.votosPositivos?.length || 0}</div>
                <div className="text-sm text-gray-600">Votos positivos</div>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-red-600">{extendedUser.votosNegativos?.length || 0}</div>
                <div className="text-sm text-gray-600">Votos negativos</div>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-orange-600">{notificaciones.length}</div>
                <div className="text-sm text-gray-600">Notificaciones</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">DNI:</span>
                      <span className="ml-2 text-gray-900">{extendedUser.dni}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">{extendedUser.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Miembro desde:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(extendedUser.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-600">💡</span>
                      <span className="text-sm text-gray-600">
                        {extendedUser.propuestas?.length || 0} propuestas creadas
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-600">👍</span>
                      <span className="text-sm text-gray-600">
                        {extendedUser.votosPositivos?.length || 0} votos positivos dados
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-red-600">👎</span>
                      <span className="text-sm text-gray-600">
                        {extendedUser.votosNegativos?.length || 0} votos negativos dados
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'proposals' && (
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Mis Propuestas</h3>
                  <Button
                    onClick={() => setShowCreateProposalModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    ➕ Crear Nueva Propuesta
                  </Button>
                </div>
                {extendedUser.propuestas && extendedUser.propuestas.length > 0 ? (
                  <div className="space-y-4">
                    {extendedUser.propuestas.map((propuesta: any) => (
                      <div key={propuesta.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <h4 className="font-medium text-gray-900">{propuesta.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{propuesta.descripcion}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(propuesta.createdAt).toLocaleDateString('es-ES')}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditPropuesta(propuesta)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeletePropuesta(propuesta.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl">💡</span>
                    <p className="text-gray-600 mt-2">Aún no has creado ninguna propuesta</p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowCreateProposalModal(true)}
                    >
                      Crear primera propuesta
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'votes' && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-green-600 mr-2">👍</span>
                    Votos Positivos
                  </h3>
                  {extendedUser.votosPositivos && extendedUser.votosPositivos.length > 0 ? (
                    <div className="space-y-3">
                      {extendedUser.votosPositivos.map((voto: any) => (
                        <div key={voto.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <h4 className="font-medium text-gray-900">{voto.tituloPropuesta}</h4>
                          {voto.descripcionPropuesta && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{voto.descripcionPropuesta}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Votado el {new Date(voto.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No has dado votos positivos aún</p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-red-600 mr-2">👎</span>
                    Votos Negativos
                  </h3>
                  {extendedUser.votosNegativos && extendedUser.votosNegativos.length > 0 ? (
                    <div className="space-y-3">
                      {extendedUser.votosNegativos.map((voto: any) => (
                        <div key={voto.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <h4 className="font-medium text-gray-900">{voto.tituloPropuesta}</h4>
                          {voto.descripcionPropuesta && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{voto.descripcionPropuesta}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Votado el {new Date(voto.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No has dado votos negativos aún</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
                {notificaciones.length > 0 ? (
                  <div className="space-y-4">
                    {notificaciones.map((notif) => (
                      <div key={notif.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900">{notif.mensaje}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            Marcar como leída
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl">🔔</span>
                    <p className="text-gray-600 mt-2">No tienes notificaciones nuevas</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Privacidad</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Perfil Privado</h4>
                      <p className="text-sm text-gray-600">
                        Si activas esta opción, tu perfil no será visible para otros usuarios
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.perfilPrivado}
                        onChange={(e) => setSettings(prev => ({ ...prev, perfilPrivado: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Mostrar Nombre Público</h4>
                      <p className="text-sm text-gray-600">
                        Permitir que otros usuarios vean tu nombre en las propuestas
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.mostrarNombrePublico}
                        onChange={(e) => setSettings(prev => ({ ...prev, mostrarNombrePublico: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Mostrar Votos Públicos</h4>
                      <p className="text-sm text-gray-600">
                        Permitir que otros usuarios vean en qué propuestas has votado
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.mostrarVotosPublicos}
                        onChange={(e) => setSettings(prev => ({ ...prev, mostrarVotosPublicos: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={updateSettings}
                      loading={updating}
                      className="w-full sm:w-auto"
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Propuesta</h2>
                <button
                  onClick={() => setShowCreateProposalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <CreateProposalForm
                user={{
                  id: extendedUser.id,
                  dni: extendedUser.dni,
                  nombreMostrado: extendedUser.nombreMostrado,
                  perfilPrivado: extendedUser.perfilPrivado,
                  mostrarNombrePublico: extendedUser.mostrarNombrePublico,
                  mostrarVotosPublicos: extendedUser.mostrarVotosPublicos,
                }}
                onSuccess={() => {
                  setShowCreateProposalModal(false);
                  loadExtendedUserData(); // Reload user data to show new proposal
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && (
        <EditProposalModal
          isOpen={!!editingProposal}
          onClose={() => setEditingProposal(null)}
          proposal={editingProposal}
          onSave={handleSaveEditedProposal}
        />
      )}
    </Layout>
  );
};

export default Perfil;