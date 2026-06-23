import React, { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import {
  formatCurrency,
  formatDate,
  AGREEMENT_STATUS_CONFIG,
} from '../../src/utils/formatters';
import type { Agreement, AgreementStatus } from '../../src/types';

const FILTERS: { label: string; status?: AgreementStatus }[] = [
  { label: 'Todos' },
  { label: 'Ativos', status: 'ACTIVE' },
  { label: 'Pendentes', status: 'PENDING_ACCEPTANCE' },
  { label: 'Em disputa', status: 'IN_DISPUTE' },
  { label: 'Concluídos', status: 'COMPLETED' },
];

function AgreementItem({ item, userId }: { item: Agreement; userId: string }) {
  const isPayer = item.payerId === userId;
  const counterpart = isPayer ? item.receiver : item.payer;
  const statusCfg = AGREEMENT_STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/agreements/[id]', params: { id: item.id } })}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.roleIcon,
              { backgroundColor: isPayer ? Colors.warningLight : Colors.successLight },
            ]}
          >
            <Ionicons
              name={isPayer ? 'arrow-up-outline' : 'arrow-down-outline'}
              size={14}
              color={isPayer ? Colors.warning : Colors.success}
            />
          </View>
          <View>
            <Text style={styles.cardRole}>{isPayer ? 'Pagador' : 'Recebedor'}</Text>
            <Text style={styles.cardCounterpart}>{counterpart.name}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title || 'Acordo'}
      </Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textLight} />
          <Text style={styles.metaText}>Vence {formatDate(item.dueDate)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="shield-checkmark-outline" size={12} color={Colors.primary} />
          <Text style={[styles.metaText, { color: Colors.primary }]}>Acordo</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.cardAmount}>{formatCurrency(item.amount)}</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function AgreementsScreen() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);

  const fetchAgreements = useCallback(async () => {
    try {
      const params = FILTERS[activeFilter].status
        ? { status: FILTERS[activeFilter].status }
        : {};
      const { data } = await api.get<Agreement[]>('/agreements', { params });
      setAgreements(data);
    } catch {
      // silently ignore; auth guard will redirect on 401
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchAgreements().finally(() => setLoading(false));
  }, [fetchAgreements]);

  useFocusEffect(
    useCallback(() => {
      fetchAgreements().catch(() => {});
    }, [fetchAgreements]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAgreements().catch(() => {});
    setRefreshing(false);
  }, [fetchAgreements]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Acordos</Text>
        <Text style={styles.headerSubtitle}>
          {agreements.length} acordo{agreements.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
        style={styles.filtersContainer}
      >
        {FILTERS.map((f, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.filterChip, activeFilter === idx && styles.filterChipActive]}
            onPress={() => setActiveFilter(idx)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterLabel, activeFilter === idx && styles.filterLabelActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {agreements.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={56} color={Colors.borderLight} />
              <Text style={styles.emptyTitle}>Nenhum acordo encontrado</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 0
                  ? 'Você ainda não participa de nenhum acordo.'
                  : `Nenhum acordo com status "${FILTERS[activeFilter].label}".`}
              </Text>
            </View>
          ) : (
            agreements.map((item) => (
              <AgreementItem key={item.id} item={item} userId={user?.id ?? ''} />
            ))
          )}
          <View style={{ height: 140 }} />
        </ScrollView>
      )}

      {/* FAB: novo acordo */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/agreements/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
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
    paddingBottom: Spacing.xxl,
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

  filtersContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    maxHeight: 56,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
  },
  filterLabelActive: { color: Colors.white },

  list: { flex: 1 },
  listContent: { padding: Spacing.lg },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  roleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRole: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  cardCounterpart: {
    fontSize: Typography.fontSizeSm,
    color: Colors.text,
    fontWeight: Typography.fontWeightMedium,
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
  cardTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cardAmount: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },

  emptyBox: {
    alignItems: 'center',
    paddingTop: Spacing.xxxxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  fab: {
    position: 'absolute',
    right: Spacing.xxl,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
