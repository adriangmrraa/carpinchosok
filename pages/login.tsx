'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useUser } from '../components/UserContext';

const Login = () => {
  const [form, setForm] = useState({ dniOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.dniOrEmail.trim() || !form.password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const success = await login(form.dniOrEmail, form.password);

      if (success) {
        // Redirect to home or intended page
        const redirectTo = (router.query.redirect as string) || '/';
        router.push(redirectTo);
      } else {
        setError('Credenciales incorrectas');
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
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Iniciar sesión
          </h2>
          <p className="text-gray-600">
            Accede a tu cuenta de participación ciudadana
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DNI or Email */}
              <Input
                label="DNI o Email"
                type="text"
                value={form.dniOrEmail}
                onChange={(e) => setForm({ ...form, dniOrEmail: e.target.value })}
                placeholder="Ingresa tu DNI o email"
                required
                autoComplete="username"
              />

              {/* Password */}
              <Input
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                required
                autoComplete="current-password"
              />

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
              >
                Iniciar sesión
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">ℹ️</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Información de prueba
                  </h4>
                  <p className="text-xs text-blue-700">
                    Para probar la aplicación, puedes usar las credenciales de prueba que configures en tu base de datos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Al iniciar sesión, aceptas nuestros términos de uso y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;