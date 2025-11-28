'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Registro = () => {
  const [form, setForm] = useState({
    dni: '',
    email: '',
    password: '',
    confirmPassword: '',
    perfilPrivado: false,
    mostrarNombrePublico: true,
    mostrarVotosPublicos: true,
    lat: 0,
    lng: 0,
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada por este navegador');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('No se pudo obtener tu ubicación. Verifica los permisos de geolocalización.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const validateForm = () => {
    if (!form.dni.trim()) return 'El DNI es obligatorio';
    if (!/^\d{7,8}$/.test(form.dni.replace(/\D/g, ''))) return 'El DNI debe tener 7 u 8 dígitos';
    if (!form.email.trim()) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'El email no es válido';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden';
    if (form.lat === 0 && form.lng === 0) return 'Se requiere tu ubicación para validar la residencia';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();

      if (response.ok) {
        alert('¡Registro exitoso! Revisa tu email para verificar tu cuenta.');
        router.push('/login');
      } else {
        setError(data.error || 'Error en el registro');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crear cuenta
          </h2>
          <p className="text-gray-600">
            Únete a la comunidad de participación ciudadana
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DNI */}
              <Input
                label="DNI"
                type="text"
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
                placeholder="Ingresa tu DNI (7-8 dígitos)"
                maxLength={8}
                required
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                required
              />

              {/* Password */}
              <Input
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
              />

              {/* Confirm Password */}
              <Input
                label="Confirmar contraseña"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repite tu contraseña"
                required
              />

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    loading={locationLoading}
                    variant="secondary"
                    size="sm"
                  >
                    📍 Obtener ubicación
                  </Button>
                  {(form.lat !== 0 || form.lng !== 0) && (
                    <span className="text-sm text-green-600 flex items-center">
                      ✅ Ubicación obtenida
                    </span>
                  )}
                </div>
                {locationError && (
                  <p className="text-sm text-red-600">{locationError}</p>
                )}
                <p className="text-xs text-gray-500">
                  Necesitamos tu ubicación para validar que resides en la zona permitida.
                </p>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Configuración de privacidad</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Perfil privado</span>
                    <p className="text-xs text-gray-500">Oculta tu perfil de otros usuarios</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.perfilPrivado}
                      onChange={(e) => setForm({ ...form, perfilPrivado: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mostrar nombre público</span>
                    <p className="text-xs text-gray-500">Permitir que otros vean tu nombre</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.mostrarNombrePublico}
                      onChange={(e) => setForm({ ...form, mostrarNombrePublico: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mostrar votos públicos</span>
                    <p className="text-xs text-gray-500">Permitir que otros vean tus votos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.mostrarVotosPublicos}
                      onChange={(e) => setForm({ ...form, mostrarVotosPublicos: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                disabled={locationLoading}
              >
                Crear cuenta
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Registro;