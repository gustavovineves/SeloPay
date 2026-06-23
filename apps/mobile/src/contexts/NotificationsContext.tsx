import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { Colors } from '../theme';
import type { Agreement } from '../types';

export interface NotifItem {
  id: string;
  agreementId?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  date: string;
  urgent: boolean;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Agora mesmo';
  if (mins < 60) return `${mins} min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function buildNotifications(agreements: Agreement[], userId: string): NotifItem[] {
  const items: NotifItem[] = [];

  for (const a of agreements) {
    const isPayer = a.payerId === userId;
    const counterpart = isPayer ? a.receiver : a.payer;
    const name = counterpart.name.split(' ')[0];
    const date = a.updatedAt ?? a.createdAt;

    switch (a.status) {
      case 'PENDING_ACCEPTANCE':
        if (isPayer) {
          items.push({
            id: `${a.id}-sent`,
            agreementId: a.id,
            icon: 'time-outline',
            iconColor: Colors.warning,
            iconBg: Colors.warningLight,
            title: 'Aguardando aceite',
            description: `Seu acordo com ${name} está aguardando confirmação.`,
            date: a.createdAt,
            urgent: false,
          });
        } else {
          items.push({
            id: `${a.id}-received`,
            agreementId: a.id,
            icon: 'alert-circle-outline',
            iconColor: Colors.warning,
            iconBg: Colors.warningLight,
            title: 'Aceite pendente',
            description: `${name} enviou um acordo para você. Toque para aceitar ou recusar.`,
            date: a.createdAt,
            urgent: true,
          });
        }
        break;

      case 'WAITING_DEPOSIT':
        if (isPayer) {
          items.push({
            id: `${a.id}-deposit`,
            agreementId: a.id,
            icon: 'cash-outline',
            iconColor: Colors.primary,
            iconBg: Colors.primary + '12',
            title: 'Depósito pendente',
            description: `${name} aceitou o acordo. Realize o depósito para ativar.`,
            date,
            urgent: true,
          });
        }
        break;

      case 'ACTIVE':
        items.push({
          id: `${a.id}-active`,
          agreementId: a.id,
          icon: 'checkmark-circle-outline',
          iconColor: Colors.success,
          iconBg: Colors.successLight,
          title: 'Acordo ativo',
          description: `Acordo com ${name} está em andamento.`,
          date,
          urgent: false,
        });
        break;

      case 'IN_DISPUTE':
        items.push({
          id: `${a.id}-dispute`,
          agreementId: a.id,
          icon: 'warning-outline',
          iconColor: Colors.error,
          iconBg: Colors.errorLight,
          title: 'Contestação aberta',
          description: `Há uma contestação aberta no acordo com ${name}.`,
          date,
          urgent: true,
        });
        break;

      case 'IN_NEGOTIATION':
        items.push({
          id: `${a.id}-negotiation`,
          agreementId: a.id,
          icon: 'chatbubbles-outline',
          iconColor: Colors.warning,
          iconBg: Colors.warningLight,
          title: 'Renegociação proposta',
          description: `Uma renegociação foi proposta no acordo com ${name}.`,
          date,
          urgent: true,
        });
        break;

      case 'EXPIRED':
        items.push({
          id: `${a.id}-expired`,
          agreementId: a.id,
          icon: 'hourglass-outline',
          iconColor: Colors.error,
          iconBg: Colors.errorLight,
          title: 'Acordo expirado',
          description: `O acordo com ${name} expirou sem confirmação das partes.`,
          date,
          urgent: false,
        });
        break;

      case 'COMPLETED':
        items.push({
          id: `${a.id}-completed`,
          agreementId: a.id,
          icon: 'trophy-outline',
          iconColor: Colors.success,
          iconBg: Colors.successLight,
          title: 'Acordo concluído',
          description: `O acordo com ${name} foi concluído com sucesso. +5 pontos de reputação.`,
          date: a.completedAt ?? date,
          urgent: false,
        });
        break;

      case 'REJECTED':
        items.push({
          id: `${a.id}-rejected`,
          agreementId: a.id,
          icon: 'close-circle-outline',
          iconColor: Colors.error,
          iconBg: Colors.errorLight,
          title: 'Acordo recusado',
          description: isPayer
            ? `${name} recusou o seu acordo.`
            : `Você recusou o acordo enviado por ${name}.`,
          date,
          urgent: false,
        });
        break;

      case 'CANCELLED':
        items.push({
          id: `${a.id}-cancelled`,
          agreementId: a.id,
          icon: 'ban-outline',
          iconColor: Colors.textLight,
          iconBg: Colors.borderLight,
          title: 'Acordo cancelado',
          description: `O acordo com ${name} foi cancelado.`,
          date,
          urgent: false,
        });
        break;
    }
  }

  return items.sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

interface NotificationsContextValue {
  notifications: NotifItem[];
  readIds: Set<string>;
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({} as NotificationsContextValue);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get<Agreement[]>('/agreements');
      setNotifications(buildNotifications(data, user.id));
    } catch {
      // silently ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [user, fetchData]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData().catch(() => {});
    setRefreshing(false);
  }, [fetchData]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id) && n.urgent).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, readIds, unreadCount, loading, refreshing, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
