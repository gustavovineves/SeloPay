import type { AgreementStatus, WalletTransactionType } from '../types';
import { Colors } from '../theme';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDatetime(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export const AGREEMENT_STATUS_CONFIG: Record<
  AgreementStatus,
  { label: string; bg: string; color: string }
> = {
  DRAFT: { label: 'Rascunho', bg: Colors.borderLight, color: Colors.textSecondary },
  PENDING_ACCEPTANCE: { label: 'Aguardando aceite', bg: '#FFF8E1', color: '#F57F17' },
  EXPIRED: { label: 'Expirado', bg: Colors.errorLight, color: Colors.error },
  REJECTED: { label: 'Recusado', bg: Colors.errorLight, color: Colors.error },
  WAITING_DEPOSIT: { label: 'Aguardando depósito', bg: '#E3F2FD', color: '#1565C0' },
  ACTIVE: { label: 'Ativo', bg: Colors.successLight, color: Colors.success },
  IN_NEGOTIATION: { label: 'Em negociação', bg: '#FFF3E0', color: '#E65100' },
  IN_DISPUTE: { label: 'Em disputa', bg: Colors.errorLight, color: Colors.error },
  COMPLETED: { label: 'Concluído', bg: Colors.successLight, color: Colors.success },
  CANCELLED: { label: 'Cancelado', bg: Colors.borderLight, color: Colors.textLight },
};

export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  SIMULATED_DEPOSIT: 'Depósito via Pix',
  VALUE_HELD: 'Valor guardado (acordo)',
  VALUE_RELEASED: 'Valor liberado',
  VALUE_RECEIVED: 'Valor recebido',
  SIMULATED_REFUND: 'Reembolso',
  VALUE_LOCKED_BY_DISPUTE: 'Bloqueado por disputa',
  DISPUTE_RESOLVED_RELEASE: 'Liberado por decisão',
  DISPUTE_RESOLVED_REFUND: 'Reembolsado por decisão',
};

export function isTransactionCredit(type: WalletTransactionType): boolean {
  return ['SIMULATED_DEPOSIT', 'VALUE_RECEIVED', 'VALUE_RELEASED', 'SIMULATED_REFUND', 'DISPUTE_RESOLVED_REFUND', 'DISPUTE_RESOLVED_RELEASE'].includes(type);
}
