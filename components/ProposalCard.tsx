'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from './ui/Card';
import Button from './ui/Button';

interface Proposal {
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

interface ProposalCardProps {
  proposal: Proposal;
  currentUserId?: number;
  onVote?: (proposalId: number, valor: 1 | -1) => Promise<void>;
  onReport?: (proposalId: number) => Promise<void>;
  onEdit?: (proposal: Proposal) => void;
  onDelete?: (proposalId: number) => Promise<void>;
  showActions?: boolean;
}

export default function ProposalCard({
  proposal,
  currentUserId,
  onVote,
  onReport,
  onEdit,
  onDelete,
  showActions = true,
}: ProposalCardProps) {
  const [voting, setVoting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = currentUserId === proposal.autorId;

  const handleVote = async (valor: 1 | -1) => {
    if (!onVote) return;
    setVoting(true);
    try {
      await onVote(proposal.id, valor);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleReport = async () => {
    if (!onReport) return;
    setReporting(true);
    try {
      await onReport(proposal.id);
    } catch (error) {
      console.error('Error reporting:', error);
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) return;
    setDeleting(true);
    try {
      await onDelete(proposal.id);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/propuestas/${proposal.id}`} className="block">
      <Card className="mb-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                {proposal.titulo}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link
                  href={`/usuarios/${proposal.autorId}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Por {proposal.autorNombre}
                </Link>
                <span>•</span>
                <span>{proposal.localidad}</span>
                <span>•</span>
                <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {isAuthor && showActions && (
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(proposal);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  loading={deleting}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-gray-700">
            <p className="whitespace-pre-wrap">{proposal.descripcion}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="text-green-600">👍</span>
              <span>{proposal.votosPositivos}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-red-600">👎</span>
              <span>{proposal.votosNegativos}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-orange-600">🚩</span>
              <span>{proposal.cantidadReportes}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Layout */}
              <div className="block md:hidden space-y-3">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(1);
                    }}
                    loading={voting}
                    className="flex items-center justify-center space-x-1 w-full"
                  >
                    <span>👍</span>
                    <span>Votar a favor</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(-1);
                    }}
                    loading={voting}
                    className="flex items-center justify-center space-x-1 w-full"
                  >
                    <span>👎</span>
                    <span>Votar en contra</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReport();
                    }}
                    loading={reporting}
                    className="w-full"
                  >
                    Reportar
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(1);
                    }}
                    loading={voting}
                    className="flex items-center space-x-1"
                  >
                    <span>👍</span>
                    <span>Votar a favor</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(-1);
                    }}
                    loading={voting}
                    className="flex items-center space-x-1"
                  >
                    <span>👎</span>
                    <span>Votar en contra</span>
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReport();
                  }}
                  loading={reporting}
                >
                  Reportar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}