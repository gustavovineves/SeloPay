import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import { adminApi } from '../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { formatCurrency, formatDate } from '../../src/utils/formatters';
import type { AdminDispute } from '../../src/types';

const DISPUTE_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  OPEN: { label: 'Em disputa', bg: '#FFF0F0', color: Colors.error },
  UNDER_REVIEW: { label: 'Em análise', bg: '#FFF8E1', color: '#F57F17' },
  RESOLVED: { label: 'Resolvido', bg: '#F0FFF5', color: Colors.success },
  CLOSED: { label: 'Encerrado', bg: Colors.borderLight, color: Colors.textLight },
};

function DisputeCard({ item, onPress }: { item: AdminDispute; onPress: () => void }) {
  const ag = item.agreement;
  const statusCfg = DISPUTE_STATUS_CONFIG[item.status] ?? DISPUTE_STATUS_CONFIG.OPEN;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: '#E3F2FD' }]}>
          <Text style={[styles.typeBadgeText, { color: '#1565C0' }]}>Acordo</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

      <View style={styles.row}>
        <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.rowLabel}>Pagador:</Text>
        <Text style={styles.rowValue}>{ag.payer.name}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.rowLabel}>Recebedor:</Text>
        <Text style={styles.rowValue}>{ag.receiver.name}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.rowLabel}>Valor:</Text>
        <Text style={[styles.rowValue, styles.amount]}>{formatCurrency(ag.amount)}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="flag-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.rowLabel}>Aberto por:</Text>
        <Text style={styles.rowValue}>{item.openedBy.name}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        {item.responses.length > 0 && (
          <View style={styles.responseBadge}>
            <Ionicons name="chatbubble-outline" size={12} color={Colors.primary} />
            <Text style={styles.responseBadgeText}>Resposta enviada</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDisputesScreen() {
  const { admin, adminSignOut } = useAdminAuth();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDisputes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await adminApi.get<AdminDispute[]>('/admin/disputes');
      // Prioritize open/under_review at top
      const sorted = [...data].sort((a, b) => {
        const order = { OPEN: 0, UNDER_REVIEW: 1, RESOLVED: 2, CLOSED: 3 };
        const diff = (order[a.status as keyof typeof order] ?? 9) - (order[b.status as keyof typeof order] ?? 9);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setDisputes(sorted);
    } catch (err: any) {
      if (!silent) Alert.alert('Erro', err.message ?? 'Não foi possível carregar as disputas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDisputes(true);
    }, [fetchDisputes]),
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchDisputes(true);
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão administrativa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => adminSignOut() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Moderação</Text>
          <Text style={styles.headerSubtitle}>{admin?.name ?? 'Admin'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>
            {disputes.filter((d) => d.status === 'OPEN').length}
          </Text>
          <Text style={styles.summaryLabel}>Em disputa</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>
            {disputes.filter((d) => d.status === 'UNDER_REVIEW').length}
          </Text>
          <Text style={styles.summaryLabel}>Em análise</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>
            {disputes.filter((d) => d.status === 'RESOLVED').length}
          </Text>
          <Text style={styles.summaryLabel}>Resolvidos</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={disputes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Nenhuma contestação encontrada</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DisputeCard
              item={item}
              onPress={() => router.push(`/(admin)/dispute/${item.id}` as any)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: Typography.fontSize2xl, fontWeight: Typography.fontWeightBold, color: Colors.white },
  headerSubtitle: { fontSize: Typography.fontSizeSm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryCount: { fontSize: Typography.fontSize2xl, fontWeight: Typography.fontWeightBold, color: Colors.white },
  summaryLabel: { fontSize: Typography.fontSizeXs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  list: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    minHeight: '100%',
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightSemiBold },
  typeBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  typeBadgeText: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightMedium },

  cardTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  rowLabel: { fontSize: Typography.fontSizeSm, color: Colors.textSecondary, width: 72 },
  rowValue: { fontSize: Typography.fontSizeSm, color: Colors.text, flex: 1 },
  amount: { fontWeight: Typography.fontWeightSemiBold, color: Colors.primary },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateText: { fontSize: Typography.fontSizeXs, color: Colors.textLight },
  responseBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  responseBadgeText: { fontSize: Typography.fontSizeXs, color: Colors.primary, fontWeight: Typography.fontWeightMedium },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxxl, gap: Spacing.md },
  emptyText: { fontSize: Typography.fontSizeMd, color: Colors.textLight },
});
