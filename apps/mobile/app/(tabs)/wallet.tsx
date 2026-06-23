import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import {
  formatCurrency,
  formatDatetime,
  TRANSACTION_TYPE_LABELS,
  isTransactionCredit,
} from '../../src/utils/formatters';
import type { Wallet, WalletTransaction, VirtualCard } from '../../src/types';

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [virtualCard, setVirtualCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      const [w, t] = await Promise.all([
        api.get<Wallet>('/wallet'),
        api.get<WalletTransaction[]>('/wallet/transactions'),
      ]);
      setWallet(w.data);
      setTransactions(t.data);
    } catch {
      // silently ignore; auth guard will redirect on 401
    }
  }, []);

  useEffect(() => {
    api.get<VirtualCard>('/virtual-card/me').then((r) => setVirtualCard(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData().catch(() => {});
    setRefreshing(false);
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carteira</Text>
        </View>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carteira</Text>
          <Text style={styles.headerSubtitle}>Saldo e movimentações</Text>
        </View>

        {/* Cards de saldo */}
        <View style={styles.balancesWrap}>
          <View style={styles.balanceRow}>
            <View style={[styles.balanceCard, { backgroundColor: Colors.primary }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balCardLabel}>Disponível</Text>
              <Text style={styles.balCardValue}>
                {wallet ? formatCurrency(wallet.availableBalance) : '—'}
              </Text>
            </View>
            <View style={[styles.balanceCard, { backgroundColor: Colors.textSecondary }]}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balCardLabel}>Em acordos</Text>
              <Text style={styles.balCardValue}>
                {wallet ? formatCurrency(wallet.blockedBalance) : '—'}
              </Text>
            </View>
          </View>

          {/* Total */}
          <Card padding="md" style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total na carteira</Text>
              <Text style={styles.totalValue}>
                {wallet
                  ? formatCurrency(wallet.availableBalance + wallet.blockedBalance)
                  : '—'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Botão de depósito */}
        <View style={styles.depositWrap}>
          <Button
            title="Adicionar saldo"
            variant="secondary"
            size="md"
            fullWidth
            onPress={() => router.push('/deposit')}
          />
          <Text style={styles.depositNote}>
            Adicione dinheiro via Pix para usar em acordos.
          </Text>
        </View>

        {/* Cartão SeloPay */}
        <TouchableOpacity
          style={styles.cardBanner}
          onPress={() => (router as any).push('/virtual-card')}
          activeOpacity={0.8}
        >
          <View style={styles.cardBannerIcon}>
            <Ionicons name="card-outline" size={22} color={Colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardBannerTitle}>Cartão SeloPay</Text>
            <Text style={styles.cardBannerDesc}>
              {virtualCard?.status === 'ACTIVE'
                ? `Limite disponível: ${formatCurrency(virtualCard.creditLimit - virtualCard.usedLimit)}`
                : 'Crédito baseado no seu nível de confiança'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Histórico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de movimentações</Text>

          {transactions.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <Ionicons name="swap-horizontal-outline" size={36} color={Colors.borderLight} />
              <Text style={styles.emptyTitle}>Nenhuma movimentação</Text>
              <Text style={styles.emptyText}>
                As movimentações aparecerão aqui ao participar de acordos.
              </Text>
            </Card>
          ) : (
            transactions.map((tx) => {
              const isCredit = isTransactionCredit(tx.type);
              return (
                <Card key={tx.id} padding="md" style={styles.txCard}>
                  <View style={styles.txRow}>
                    <View
                      style={[
                        styles.txIcon,
                        { backgroundColor: isCredit ? Colors.successLight : Colors.errorLight },
                      ]}
                    >
                      <Ionicons
                        name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
                        size={16}
                        color={isCredit ? Colors.success : Colors.error}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txLabel}>
                        {TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type}
                      </Text>
                      <Text style={styles.txDesc} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text style={styles.txDate}>{formatDatetime(tx.createdAt)}</Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: isCredit ? Colors.success : Colors.error },
                      ]}
                    >
                      {isCredit ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </Text>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxxl,
  },
  headerTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  balancesWrap: {
    paddingHorizontal: Spacing.xxl,
    marginTop: -Spacing.xxxl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  balanceRow: { flexDirection: 'row', gap: Spacing.sm },
  balanceCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    ...Shadows.md,
  },
  balCardLabel: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: Typography.fontWeightMedium,
  },
  balCardValue: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  totalCard: { borderColor: Colors.borderLight },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  totalValue: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  depositWrap: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  depositNote: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    textAlign: 'center',
  },

  cardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
    ...Shadows.sm,
  },
  cardBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.secondary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBannerTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  cardBannerDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },

  section: {
    paddingHorizontal: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  txCard: { marginBottom: Spacing.sm },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  txDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  txDate: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    marginTop: 2,
  },
  txAmount: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
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
