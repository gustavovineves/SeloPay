import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';
import { formatCurrency, formatDate } from '../src/utils/formatters';
import type { VirtualCard, CardTransaction } from '../src/types';

const TIER_COLORS: Record<string, string> = {
  'Sem limite': Colors.textLight,
  Bronze: '#CD7F32',
  Prata: '#9E9E9E',
  Ouro: '#FFB300',
  Platina: '#5C6BC0',
};

const CARD_TX_LABELS: Record<string, string> = {
  GUARANTEE_BLOCK: 'Garantia bloqueada',
  GUARANTEE_RELEASE: 'Limite restituído',
  GUARANTEE_SETTLE: 'Crédito liquidado',
};

function scoreToTier(score: number): string {
  if (score < 300) return 'Sem limite';
  if (score < 500) return 'Bronze';
  if (score < 700) return 'Prata';
  if (score < 850) return 'Ouro';
  return 'Platina';
}

function scoreToLimit(score: number): number {
  if (score < 300) return 0;
  if (score < 500) return 50;
  if (score < 700) return 150;
  if (score < 850) return 300;
  return 500;
}

export default function VirtualCardScreen() {
  const { user } = useAuth();
  const [card, setCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const score = user?.score ?? 0;
  const tier = scoreToTier(score);
  const tierColor = TIER_COLORS[tier] ?? Colors.primary;
  const estimatedLimit = scoreToLimit(score);

  const fetchCard = async () => {
    try {
      const { data } = await api.get<VirtualCard>('/virtual-card/me');
      setCard(data);
    } catch {
      setCard(null);
    }
  };

  useEffect(() => {
    fetchCard().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCard().catch(() => {});
    setRefreshing(false);
  };

  async function handleActivate() {
    if (score < 300) {
      Alert.alert('Score insuficiente', 'Você precisa de pelo menos 300 pontos de score para ativar o cartão.');
      return;
    }
    Alert.alert(
      'Ativar Cartão SeloPay',
      `Seu limite inicial será de ${formatCurrency(estimatedLimit)} com base no seu score de ${score} pts.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ativar',
          onPress: async () => {
            setActivating(true);
            try {
              const { data } = await api.post<VirtualCard>('/virtual-card/activate');
              setCard(data);
              Alert.alert('Cartão ativado', `Limite de ${formatCurrency(data.creditLimit)} disponível.`);
            } catch (err: any) {
              Alert.alert('Erro', err.message ?? 'Não foi possível ativar o cartão.');
            } finally {
              setActivating(false);
            }
          },
        },
      ],
    );
  }

  async function handleRecalculate() {
    try {
      const { data } = await api.post<VirtualCard>('/virtual-card/recalculate-limit');
      setCard(data);
      Alert.alert('Limite atualizado', `Novo limite: ${formatCurrency(data.creditLimit)}`);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível atualizar o limite.');
    }
  }

  const availableLimit = card ? card.creditLimit - card.usedLimit : 0;
  const usedPercent = card && card.creditLimit > 0 ? (card.usedLimit / card.creditLimit) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cartão SeloPay</Text>
          <Text style={styles.headerSub}>Crédito baseado no seu nível de confiança</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
        contentContainerStyle={styles.body}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primaryLight} style={{ marginTop: Spacing.xxxl }} />
        ) : !card || card.status === 'INACTIVE' ? (
          <>
            {/* Card visual pré-ativação */}
            <View style={[styles.cardVisual, { opacity: 0.55 }]}>
              <View style={styles.cardChip}>
                <Ionicons name="hardware-chip-outline" size={28} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.cardNumber}>**** **** **** ????</Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardHolderLabel}>TITULAR</Text>
                  <Text style={styles.cardHolder}>{user?.name.toUpperCase() ?? '—'}</Text>
                </View>
                <View style={styles.cardBrand}>
                  <Text style={styles.cardBrandText}>SELOPAY</Text>
                </View>
              </View>
            </View>

            <View style={styles.inactiveBox}>
              <View style={[styles.tierBadge, { backgroundColor: tierColor + '20', borderColor: tierColor + '50' }]}>
                <Text style={[styles.tierText, { color: tierColor }]}>{tier}</Text>
              </View>
              <Text style={styles.inactiveTitle}>Cartão não ativado</Text>
              <Text style={styles.inactiveDesc}>
                Com seu score atual de <Text style={styles.bold}>{score} pts</Text> você tem acesso a um limite de{' '}
                <Text style={styles.bold}>{formatCurrency(estimatedLimit)}</Text>. Ative para usar em acordos com garantia.
              </Text>
              <TouchableOpacity
                style={[styles.activateBtn, (activating || score < 300) && styles.btnDisabled]}
                onPress={handleActivate}
                disabled={activating || score < 300}
                activeOpacity={0.85}
              >
                {activating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={20} color={Colors.white} />
                    <Text style={styles.activateBtnText}>
                      {score < 300 ? 'Score insuficiente' : 'Ativar cartão'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <LimitExplainer />
          </>
        ) : (
          <>
            {/* Card visual ativo */}
            <View style={styles.cardVisual}>
              <View style={styles.cardChip}>
                <Ionicons name="hardware-chip-outline" size={28} color="rgba(255,255,255,0.8)" />
              </View>
              <Text style={styles.cardNumber}>{card.maskedNumber}</Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardHolderLabel}>TITULAR</Text>
                  <Text style={styles.cardHolder}>{card.holderName}</Text>
                </View>
                <View>
                  <Text style={styles.cardHolderLabel}>VÁLIDO ATÉ</Text>
                  <Text style={styles.cardHolder}>{formatDate(card.expiresAt)}</Text>
                </View>
                <View style={styles.cardBrand}>
                  <Text style={styles.cardBrandText}>SELOPAY</Text>
                </View>
              </View>
            </View>

            {/* Limite */}
            <View style={styles.limitCard}>
              <View style={styles.limitRow}>
                <View>
                  <Text style={styles.limitLabel}>Limite disponível</Text>
                  <Text style={styles.limitValue}>{formatCurrency(availableLimit)}</Text>
                </View>
                <View style={[styles.tierBadge, { backgroundColor: tierColor + '20', borderColor: tierColor + '50' }]}>
                  <Text style={[styles.tierText, { color: tierColor }]}>{tier}</Text>
                </View>
              </View>

              {/* Barra de uso */}
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.min(usedPercent, 100)}%` as any }]} />
              </View>

              <View style={styles.limitDetails}>
                <Text style={styles.limitDetailText}>
                  Utilizado: <Text style={styles.bold}>{formatCurrency(card.usedLimit)}</Text>
                </Text>
                <Text style={styles.limitDetailText}>
                  Total: <Text style={styles.bold}>{formatCurrency(card.creditLimit)}</Text>
                </Text>
              </View>

              <Text style={styles.scoreNote}>
                Score atual: <Text style={styles.bold}>{score} pts</Text> — Seu limite acompanha seu nível de confiança no SeloPay.
              </Text>

              <TouchableOpacity style={styles.recalcBtn} onPress={handleRecalculate} activeOpacity={0.8}>
                <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
                <Text style={styles.recalcBtnText}>Atualizar limite com score atual</Text>
              </TouchableOpacity>
            </View>

            {/* Histórico de uso */}
            <Text style={styles.sectionTitle}>Uso do cartão</Text>
            {(card.transactions ?? []).length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={32} color={Colors.borderLight} />
                <Text style={styles.emptyText}>Nenhum uso registrado.</Text>
              </View>
            ) : (
              (card.transactions ?? []).map((tx) => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={styles.txIcon}>
                    <Ionicons
                      name={tx.type === 'GUARANTEE_RELEASE' ? 'arrow-down-outline' : 'arrow-up-outline'}
                      size={16}
                      color={tx.type === 'GUARANTEE_RELEASE' ? Colors.success : Colors.error}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txLabel}>{CARD_TX_LABELS[tx.type] ?? tx.type}</Text>
                    <Text style={styles.txDesc}>{tx.description}</Text>
                  </View>
                  <Text style={[
                    styles.txAmount,
                    { color: tx.type === 'GUARANTEE_RELEASE' ? Colors.success : Colors.error },
                  ]}>
                    {tx.type === 'GUARANTEE_RELEASE' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </Text>
                </View>
              ))
            )}

            <LimitExplainer />
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LimitExplainer() {
  const rows = [
    { tier: 'Sem limite (< 300)', limit: 'R$ 0,00' },
    { tier: 'Bronze (300–499)', limit: 'R$ 50,00' },
    { tier: 'Prata (500–699)', limit: 'R$ 150,00' },
    { tier: 'Ouro (700–849)', limit: 'R$ 300,00' },
    { tier: 'Platina (850–1000)', limit: 'R$ 500,00' },
  ];

  return (
    <View style={styles.explainerCard}>
      <Text style={styles.explainerTitle}>Como o limite é calculado</Text>
      <Text style={styles.explainerDesc}>
        O limite do Cartão SeloPay é definido pelo seu score de confiança. Conclua acordos, evite disputas e mantenha bom histórico para aumentar seu limite.
      </Text>
      {rows.map((r) => (
        <View key={r.tier} style={styles.explainerRow}>
          <Text style={styles.explainerTier}>{r.tier}</Text>
          <Text style={styles.explainerLimit}>{r.limit}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold, color: Colors.white },
  headerSub: { fontSize: Typography.fontSizeSm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  body: { padding: Spacing.xxl, gap: Spacing.lg },

  cardVisual: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.md,
    ...Shadows.lg,
  },
  cardChip: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.lg },
  cardHolderLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: Typography.fontWeightBold, letterSpacing: 1 },
  cardHolder: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.white, marginTop: 2 },
  cardBrand: { marginLeft: 'auto' },
  cardBrandText: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightExtraBold, color: 'rgba(255,255,255,0.9)', letterSpacing: 2 },

  inactiveBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  inactiveTitle: { fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold, color: Colors.text },
  inactiveDesc: { fontSize: Typography.fontSizeSm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  bold: { fontWeight: Typography.fontWeightBold, color: Colors.text },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    ...Shadows.md,
    marginTop: Spacing.xs,
  },
  activateBtnText: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold, color: Colors.white },
  btnDisabled: { opacity: 0.45 },
  tierBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tierText: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightBold },

  limitCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.md,
  },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  limitLabel: { fontSize: Typography.fontSizeSm, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium },
  limitValue: { fontSize: Typography.fontSize2xl, fontWeight: Typography.fontWeightExtraBold, color: Colors.text },
  progressBg: { height: 8, backgroundColor: Colors.borderLight, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: Radius.full },
  limitDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  limitDetailText: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary },
  scoreNote: { fontSize: Typography.fontSizeXs, color: Colors.textLight, lineHeight: 17 },
  recalcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    alignSelf: 'flex-start',
  },
  recalcBtnText: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.primary },

  sectionTitle: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.text },
  emptyBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyText: { fontSize: Typography.fontSizeSm, color: Colors.textLight },

  txCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  txIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  txLabel: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.text },
  txDesc: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary },
  txAmount: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold },

  explainerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  explainerTitle: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: 4 },
  explainerDesc: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary, lineHeight: 17, marginBottom: 4 },
  explainerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  explainerTier: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary },
  explainerLimit: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightBold, color: Colors.text },
});
