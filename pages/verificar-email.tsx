import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

type Status = 'loading' | 'success' | 'error';

export default function VerificarEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    if (!token || typeof token !== 'string') return;

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(
            data?.error ||
              'El enlace de verificación no es válido o ya expiró.'
          );
          return;
        }

        setStatus('success');
        setMessage('¡Tu email fue verificado correctamente!');
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage('Ocurrió un error al verificar tu email.');
      }
    };

    verify();
  }, [token]);

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {status === 'loading' && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                )}
                {status === 'success' && (
                  <span className="text-2xl text-green-600">✓</span>
                )}
                {status === 'error' && (
                  <span className="text-2xl text-red-600">✕</span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verificación de email
              </h1>

              <p className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </p>

              {status === 'success' && (
                <Button
                  onClick={goToLogin}
                  className="w-full"
                >
                  Ir a iniciar sesión
                </Button>
              )}

              {status === 'error' && (
                <Button
                  onClick={goToLogin}
                  variant="secondary"
                  className="w-full"
                >
                  Volver al inicio de sesión
                </Button>
              )}

              {status === 'loading' && (
                <div className="text-sm text-gray-500">
                  Procesando verificación...
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}