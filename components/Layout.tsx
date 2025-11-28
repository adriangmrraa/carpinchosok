'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';

interface Notification {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, logout } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notificaciones?soloNoLeidas=true');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}/leer`, { method: 'POST' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-gray-900">
              CARPINCHOS DECIDEN
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Inicio
              </Link>
              {user && (
                <Link href="/perfil" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Mi perfil
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      🔔
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                              No hay notificaciones nuevas
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900">{notification.mensaje}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Marcar como leída
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200">
                            <Link
                              href="/perfil"
                              className="text-sm text-blue-600 hover:text-blue-800"
                              onClick={() => setShowNotifications(false)}
                            >
                              Ver todas en mi perfil
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.nombreMostrado ? user.nombreMostrado.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block">
                      {user.nombreMostrado ? user.nombreMostrado.split(' ')[0] : 'Usuario'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}