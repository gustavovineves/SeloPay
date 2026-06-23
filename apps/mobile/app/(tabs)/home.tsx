import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotifications } from '../../src/contexts/NotificationsContext';
import { api } from '../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import {
  formatCurrency,
  formatDate,
  AGREEMENT_STATUS_CONFIG,
} from '../../src/utils/formatters';
import type { Wallet, Agreement } from '../../src/types';

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon as any} size={22} color={Colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function AgreementCard({ item, userId }: { item: Agreement; userId: string }) {
  const isPayer = item.payerId === userId;
  const counterpart = isPayer ? item.receiver : item.payer;
  const statusCfg = AGREEMENT_STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={styles.agreementCard}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/agreements/[id]', params: { id: item.id } })}
    >
      <View style={styles.agreementTop}>
        <View style={styles.agreementType}>
          <Ionicons
            name={isPayer ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
            size={18}
            color={isPayer ? Colors.warning : Colors.success}
          />
          <Text style={[styles.agreementTypeText, { color: isPayer ? Colors.warning : Colors.success }]}>
            {isPayer ? 'Pagador' : 'Recebedor'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>
      <Text style={styles.agreementTitle} numberOfLines={1}>
        {item.title || 'Acordo'}
      </Text>
      <View style={styles.agreementBottom}>
        <Text style={styles.agreementCounterpart}>{counterpart.name}</Text>
        <Text style={styles.agreementAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      <Text style={styles.agreementDate}>Vence em {formatDate(item.dueDate)}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const { unreadCount, refresh: refreshNotifications } = useNotifications();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [walletRes, agreementsRes] = await Promise.all([
        api.get<Wallet>('/wallet'),
        api.get<Agreement[]>('/agreements'),
      ]);
      setWallet(walletRes.data);
      setAgreements(agreementsRes.data.slice(0, 5));
    } catch {
      // silently ignore on refresh
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData().catch(() => {});
    }, [fetchData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchData().catch(() => {}),
      refreshUser().catch(() => {}),
      refreshNotifications().catch(() => {}),
    ]);
    setRefreshing(false);
  }, [fetchData, refreshUser, refreshNotifications]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name.split(' ')[0]} 👋</Text>
            <Text style={styles.seloKey}>{user?.seloKey}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadCount > 9 ? '9+' : String(unreadCount)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cartão de saldo */}
        <View style={styles.balanceCardWrap}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceLabelRow}>
              <Text style={styles.balanceLabel}>Saldo disponível</Text>
              <TouchableOpacity
                onPress={() => setBalanceVisible((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceValue}>
              {wallet
                ? balanceVisible
                  ? formatCurrency(wallet.availableBalance)
                  : 'R$ ••••••'
                : '—'}
            </Text>
            {wallet && wallet.blockedBalance > 0 && (
              <View style={styles.blockedRow}>
                <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.blockedText}>
                  {balanceVisible
                    ? `${formatCurrency(wallet.blockedBalance)} em acordos`
                    : '•••••• em acordos'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <Card padding="md" style={styles.quickActionsCard}>
            <View style={styles.quickActionsRow}>
              <QuickAction
                icon="add-circle-outline"
                label="Novo acordo"
                onPress={() => router.push('/agreements/create')}
              />
              <QuickAction
                icon="wallet-outline"
                label="Carteira"
                onPress={() => router.push('/(tabs)/wallet')}
              />
              <QuickAction
                icon="document-text-outline"
                label="Meus acordos"
                onPress={() => router.push('/(tabs)/agreements')}
              />
              <QuickAction
                icon="ribbon-outline"
                label="Score"
                onPress={() => router.push('/score')}
              />
            </View>
            <View style={styles.depositDivider} />
            <TouchableOpacity
              style={styles.depositRow}
              onPress={() => router.push('/deposit')}
              activeOpacity={0.8}
            >
              <View style={styles.depositRowIcon}>
                <Ionicons name="arrow-down-circle-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.depositRowLabel}>Depositar via Pix</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Acordos recentes */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Acordos recentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/agreements')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {agreements.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <Ionicons name="document-outline" size={36} color={Colors.borderLight} />
              <Text style={styles.emptyTitle}>Nenhum acordo ainda</Text>
              <Text style={styles.emptyText}>
                Crie seu primeiro acordo para começar a usar a SeloPay.
              </Text>
            </Card>
          ) : (
            agreements.map((item) => (
              <AgreementCard key={item.id} item={item} userId={user?.id ?? ''} />
            ))
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },

  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxxl,
  },
  greeting: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  seloKey: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  bellBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    lineHeight: 14,
  },

  balanceCardWrap: {
    paddingHorizontal: Spacing.xxl,
    marginTop: -Spacing.xxxl,
    marginBottom: Spacing.lg,
  },

  depositDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  depositRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositRowLabel: {
    flex: 1,
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  balanceCard: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: Typography.fontWeightMedium,
  },
  balanceValue: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  blockedText: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.7)',
  },

  section: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },

  quickActionsCard: { borderColor: Colors.borderLight },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: { alignItems: 'center', gap: Spacing.xs },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeightMedium,
    textAlign: 'center',
    maxWidth: 60,
  },

  agreementCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  agreementTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  agreementType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  agreementTypeText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightSemiBold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightSemiBold,
  },
  agreementTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  agreementBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agreementCounterpart: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },
  agreementAmount: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  agreementDate: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },

  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
