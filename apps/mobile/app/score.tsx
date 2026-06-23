import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';
import { Card } from '../src/components/ui/Card';
import { ScoreGauge } from '../src/components/ScoreGauge';
import { formatCurrency } from '../src/utils/formatters';
import type { ScoreEvent } from '../src/types';

const EVENT_LABELS: Record<string, string> = {
  AGREEMENT_COMPLETED: 'Acordo concluído',
  AGREEMENT_DISPUTED_RESOLVED: 'Disputa resolvida',
  AGREEMENT_DEFAULTED: 'Inadimplência',
  DISPUTE_OPENED_AGAINST_USER: 'Contestação recebida',
  DISPUTE_WON: 'Disputa ganha',
  DISPUTE_LOST: 'Disputa perdida',
  RENEGOTIATION_ACCEPTED: 'Renegociação aceita',
  LATE_PAYMENT: 'Pagamento em atraso',
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

const TIER_COLORS: Record<string, string> = {
  'Sem limite': Colors.textLight,
  Bronze: '#CD7F32',
  Prata: '#9E9E9E',
  Ouro: '#FFB300',
  Platina: '#5C6BC0',
};

const TIPS = [
  'Conclua acordos dentro do prazo.',
  'Confirme recebimentos e cumprimentos corretamente.',
  'Evite contestações desnecessárias.',
  'Resolva negociações de forma amigável.',
  'Mantenha um histórico positivo na SeloPay.',
];

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function ScoreScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const score = user?.score ?? 0;
  const tier = scoreToTier(score);
  const tierColor = TIER_COLORS[tier] ?? Colors.textLight;
  const cardLimit = scoreToLimit(score);

  useEffect(() => {
    if (!user) {
      setEventsLoading(false);
      return;
    }
    api
      .get<ScoreEvent[]>(`/users/${user.id}/score-events`)
      .then((r) => setEvents(r.data))
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Score SeloPay</Text>
          <Text style={styles.headerSubtitle}>Sua reputação em acordos digitais</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Gauge */}
        <Card padding="lg" elevated style={styles.gaugeCard}>
          <ScoreGauge score={user?.score ?? 0} />
        </Card>

        {/* Cartão SeloPay */}
        <TouchableOpacity
          style={styles.cardLimitRow}
          onPress={() => (router as any).push('/virtual-card')}
          activeOpacity={0.8}
        >
          <View style={[styles.cardLimitIcon, { backgroundColor: tierColor + '15' }]}>
            <Ionicons name="card-outline" size={22} color={tierColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLimitTitle}>Cartão SeloPay</Text>
            <Text style={styles.cardLimitDesc}>
              Limite:{' '}
              <Text style={[styles.cardLimitBold, { color: tierColor }]}>
                {cardLimit > 0 ? formatCurrency(cardLimit) : 'Sem limite'} — {tier}
              </Text>
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
        </TouchableOpacity>

        {/* O que é o Score? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que é o Score SeloPay?</Text>
          <Card padding="lg">
            <Text style={styles.bodyText}>
              O Score SeloPay é uma pontuação de confiança baseada no seu histórico de acordos.
              Ele considera acordos concluídos corretamente, promessas cumpridas, pagamentos
              realizados no prazo, contestações e histórico de resolução. Quanto melhor o seu
              comportamento nos acordos, maior tende a ser sua reputação.
            </Text>
          </Card>
        </View>

        {/* Como melhorar? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como melhorar seu score?</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name="checkmark" size={14} color={Colors.primary} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Histórico de pontuação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de pontuação</Text>

          {eventsLoading ? (
            <ActivityIndicator color={Colors.primaryLight} style={{ marginTop: Spacing.md }} />
          ) : events.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <Ionicons name="analytics-outline" size={32} color={Colors.borderLight} />
              <Text style={styles.emptyText}>Nenhum evento de score ainda.</Text>
            </Card>
          ) : (
            events.map((ev) => (
              <View key={ev.id} style={styles.eventRow}>
                <View style={styles.eventLeft}>
                  <View
                    style={[
                      styles.eventIcon,
                      {
                        backgroundColor:
                          ev.delta > 0 ? Colors.successLight : Colors.errorLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={ev.delta > 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={ev.delta > 0 ? Colors.success : Colors.error}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventLabel}>
                      {EVENT_LABELS[ev.type] ?? ev.type}
                    </Text>
                    <Text style={styles.eventDate}>{formatEventDate(ev.createdAt)}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.eventDelta,
                    { color: ev.delta > 0 ? Colors.success : Colors.error },
                  ]}
                >
                  {ev.delta > 0 ? '+' : ''}
                  {ev.delta}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
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
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  scroll: { paddingTop: Spacing.xl },

  gaugeCard: {
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
  },

  cardLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardLimitIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLimitTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  cardLimitDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
  cardLimitBold: {
    fontWeight: Typography.fontWeightBold,
  },

  section: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  bodyText: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  tipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
    paddingTop: 4,
  },

  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
  },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: { flex: 1 },
  eventLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  eventDate: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    marginTop: 2,
  },
  eventDelta: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    minWidth: 36,
    textAlign: 'right',
  },
});
