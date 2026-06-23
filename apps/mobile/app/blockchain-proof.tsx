import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';
import { formatDatetime } from '../src/utils/formatters';
import type { BlockchainRecord } from '../src/types';

const EVENT_LABELS: Record<string, string> = {
  AGREEMENT_CREATED: 'Acordo criado',
  AGREEMENT_ACCEPTED: 'Acordo aceito',
  AGREEMENT_REJECTED: 'Acordo recusado',
  AGREEMENT_CANCELLED: 'Acordo cancelado',
  AGREEMENT_COMPLETED: 'Acordo concluído',
  GUARANTEE_DEPOSITED_WALLET: 'Garantia depositada (saldo)',
  GUARANTEE_DEPOSITED_PIX: 'Garantia depositada (Pix)',
  GUARANTEE_DEPOSITED_CARD: 'Garantia depositada (Cartão)',
  VALUE_RELEASED: 'Valor liberado',
  VALUE_REFUNDED: 'Valor reembolsado',
  DISPUTE_OPENED: 'Contestação aberta',
  DISPUTE_RESPONSE_ADDED: 'Resposta à contestação',
  ADMIN_DECISION_RELEASE: 'Decisão: favor ao recebedor',
  ADMIN_DECISION_REFUND: 'Decisão: reembolso ao pagador',
  ADMIN_DECISION_RENEGOTIATION: 'Decisão: renegociação',
  RENEGOTIATION_ACCEPTED: 'Renegociação aceita',
  PIX_DEPOSIT_CONFIRMED: 'Depósito Pix confirmado',
  CARD_ACTIVATED: 'Cartão ativado',
  CARD_LIMIT_RECALCULATED: 'Limite recalculado',
  CARD_LIMIT_BLOCKED: 'Limite bloqueado',
  CARD_LIMIT_RELEASED: 'Limite liberado',
};

const EVENT_ICONS: Record<string, string> = {
  AGREEMENT_CREATED: 'document-text-outline',
  AGREEMENT_ACCEPTED: 'checkmark-circle-outline',
  AGREEMENT_REJECTED: 'close-circle-outline',
  AGREEMENT_CANCELLED: 'ban-outline',
  AGREEMENT_COMPLETED: 'trophy-outline',
  GUARANTEE_DEPOSITED_WALLET: 'wallet-outline',
  GUARANTEE_DEPOSITED_PIX: 'qr-code-outline',
  GUARANTEE_DEPOSITED_CARD: 'card-outline',
  VALUE_RELEASED: 'arrow-up-circle-outline',
  VALUE_REFUNDED: 'return-down-back-outline',
  DISPUTE_OPENED: 'flag-outline',
  DISPUTE_RESPONSE_ADDED: 'chatbox-outline',
  ADMIN_DECISION_RELEASE: 'shield-checkmark-outline',
  ADMIN_DECISION_REFUND: 'shield-outline',
  ADMIN_DECISION_RENEGOTIATION: 'refresh-outline',
  RENEGOTIATION_ACCEPTED: 'calendar-outline',
  PIX_DEPOSIT_CONFIRMED: 'cash-outline',
  CARD_ACTIVATED: 'card-outline',
  CARD_LIMIT_RECALCULATED: 'analytics-outline',
  CARD_LIMIT_BLOCKED: 'lock-closed-outline',
  CARD_LIMIT_RELEASED: 'lock-open-outline',
};

function truncateHash(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export default function BlockchainProofScreen() {
  const { agreementId } = useLocalSearchParams<{ agreementId: string }>();
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!agreementId) return;
    api
      .get<BlockchainRecord[]>(`/agreements/${agreementId}/blockchain`)
      .then((r) => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agreementId]);

  async function handleVerify() {
    setVerifying(true);
    try {
      const { data } = await api.get<{ valid: boolean; totalEvents: number }>(
        `/agreements/${agreementId}/blockchain/verify`,
      );
      setVerified(data.valid);
      Alert.alert(
        data.valid ? 'Integridade confirmada' : 'Falha na verificação',
        data.valid
          ? `${data.totalEvents} evento(s) registrado(s). A cadeia de registros está íntegra.`
          : 'A cadeia de registros apresenta inconsistências.',
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível verificar a cadeia.');
    } finally {
      setVerifying(false);
    }
  }

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
          <Text style={styles.headerTitle}>Registro blockchain</Text>
          <Text style={styles.headerSub}>Histórico imutável do acordo</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Status geral */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Registro protegido</Text>
              <Text style={styles.statusDesc}>
                Cada evento deste acordo é registrado com hash criptográfico SHA-256, formando uma cadeia auditável.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.verifyBtn, verifying && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={verifying || loading}
            activeOpacity={0.85}
          >
            {verifying ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-done-outline" size={18} color={Colors.white} />
                <Text style={styles.verifyBtnText}>Verificar integridade da cadeia</Text>
              </>
            )}
          </TouchableOpacity>

          {verified !== null && (
            <View style={[styles.verifyResult, verified ? styles.verifyOk : styles.verifyFail]}>
              <Ionicons
                name={verified ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={verified ? Colors.success : Colors.error}
              />
              <Text style={[styles.verifyResultText, { color: verified ? Colors.success : Colors.error }]}>
                {verified ? 'Cadeia verificada — integridade confirmada' : 'Falha na verificação da cadeia'}
              </Text>
            </View>
          )}
        </View>

        {/* Linha do tempo */}
        <Text style={styles.sectionTitle}>
          {loading ? 'Carregando eventos…' : `${records.length} evento(s) registrado(s)`}
        </Text>

        {loading ? (
          <ActivityIndicator color={Colors.primaryLight} style={{ marginTop: Spacing.xxl }} />
        ) : records.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={36} color={Colors.borderLight} />
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
          </View>
        ) : (
          records.map((rec, idx) => (
            <View key={rec.id} style={styles.recordRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.eventIconWrap}>
                  <Ionicons
                    name={(EVENT_ICONS[rec.eventType] ?? 'ellipse-outline') as any}
                    size={16}
                    color={Colors.primary}
                  />
                </View>
                {idx < records.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordEvent}>
                    {EVENT_LABELS[rec.eventType] ?? rec.eventType}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{rec.status}</Text>
                  </View>
                </View>
                <Text style={styles.recordDate}>{formatDatetime(rec.createdAt)}</Text>
                <View style={styles.hashRow}>
                  <Ionicons name="finger-print-outline" size={12} color={Colors.textLight} />
                  <Text style={styles.hashText} numberOfLines={1}>
                    {truncateHash(rec.hash)}
                  </Text>
                </View>
                {rec.previousHash !== '0'.repeat(64) && (
                  <View style={styles.hashRow}>
                    <Ionicons name="link-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.hashText} numberOfLines={1}>
                      prev: {truncateHash(rec.previousHash)}
                    </Text>
                  </View>
                )}
                <View style={styles.txRow}>
                  <Ionicons name="receipt-outline" size={12} color={Colors.primary} />
                  <Text style={styles.txText}>{rec.txHash}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
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
  headerTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  headerSub: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  body: { padding: Spacing.xxl, gap: Spacing.lg },

  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: Spacing.md,
    ...Shadows.md,
  },
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    ...Shadows.sm,
  },
  verifyBtnText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },
  btnDisabled: { opacity: 0.45 },
  verifyResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  verifyOk: { backgroundColor: Colors.successLight },
  verifyFail: { backgroundColor: Colors.errorLight },
  verifyResultText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
  },

  sectionTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  emptyBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
  emptyText: { fontSize: Typography.fontSizeSm, color: Colors.textLight },

  recordRow: { flexDirection: 'row', gap: Spacing.md },
  timelineLeft: { alignItems: 'center', width: 36 },
  eventIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  recordCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
    gap: 4,
    ...Shadows.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordEvent: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Colors.primary + '12',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  recordDate: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hashText: {
    fontSize: 10,
    color: Colors.textLight,
    fontFamily: 'monospace',
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: 'monospace',
    fontWeight: Typography.fontWeightSemiBold,
  },
});
