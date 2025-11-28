'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

interface CreateProposalFormProps {
  user: {
    id: number;
    dni: string;
    nombreMostrado: string;
    perfilPrivado: boolean;
    mostrarNombrePublico: boolean;
    mostrarVotosPublicos: boolean;
  };
  onSuccess?: () => void;
}

export default function CreateProposalForm({ user, onSuccess }: CreateProposalFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [localidad, setLocalidad] = useState('Buenos Aires');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Safety check
  if (!user || !user.nombreMostrado) {
    console.log('CreateProposalForm: user data incomplete', user);
    return null; // Don't render if user data is incomplete
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim() || !localidad.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/propuestas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          localidad: localidad.trim(),
        }),
      });

      if (response.ok) {
        setTitulo('');
        setDescripcion('');
        setLocalidad('Buenos Aires');
        onSuccess?.();
        // Optionally refresh the page or update state
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear la propuesta');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError('Error al crear la propuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.nombreMostrado.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.nombreMostrado}</p>
            <p className="text-sm text-gray-600">¿Qué propuesta tenés para tu comunidad?</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Título de la propuesta"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Escribe un título claro y conciso..."
            maxLength={100}
            required
          />

          <Input
            label="Localidad"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            placeholder="Ej: Buenos Aires, Córdoba, Rosario..."
            maxLength={50}
            required
          />

          <Textarea
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe tu propuesta en detalle..."
            rows={4}
            maxLength={1000}
            required
          />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTitulo('');
                setDescripcion('');
                setLocalidad('Buenos Aires');
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!titulo.trim() || !descripcion.trim() || !localidad.trim()}
            >
              Publicar propuesta
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}