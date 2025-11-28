'use client';

import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: {
    id: number;
    titulo: string;
    descripcion: string;
  };
  onSave: (titulo: string, descripcion: string) => Promise<void>;
}

const EditProposalModal = ({ isOpen, onClose, proposal, onSave }: EditProposalModalProps) => {
  const [titulo, setTitulo] = useState(proposal.titulo);
  const [descripcion, setDescripcion] = useState(proposal.descripcion);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await onSave(titulo.trim(), descripcion.trim());
      onClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitulo(proposal.titulo);
    setDescripcion(proposal.descripcion);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Editar Propuesta</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Propuesta
              </label>
              <Input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ingresa el título de tu propuesta"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{titulo.length}/200 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu propuesta en detalle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical text-gray-900"
                rows={6}
                maxLength={2000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{descripcion.length}/2000 caracteres</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProposalModal;