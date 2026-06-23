import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { formatCurrency, formatDate, formatDatetime } from '../../../src/utils/formatters';
import type { AdminDispute, AdminDecisionType, DisputeEvidence, DisputeResponseEvidence } from '../../../src/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DISPUTE_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  OPEN: { label: 'Em disputa', bg: '#FFF0F0', color: Colors.error },
  UNDER_REVIEW: { label: 'Em análise', bg: '#FFF8E1', color: '#F57F17' },
  RESOLVED: { label: 'Resolvido', bg: '#F0FFF5', color: Colors.success },
  CLOSED: { label: 'Encerrado', bg: Colors.borderLight, color: Colors.textLight },
};

// Keep all values for displaying historical decisions
const DECISION_LABELS: Partial<Record<string, string>> = {
  RELEASE_TO_RECEIVER: 'Decisão: Favor ao recebedor',
  REFUND_TO_PAYER: 'Decisão: Favor ao pagador',
  PROPOSE_RENEGOTIATION: 'Renegociação proposta',
  REQUEST_MORE_EVIDENCE: 'Mais informações solicitadas',
  KEEP_LOCKED: 'Valor mantido bloqueado',
};

type DecisionOption = {
  decision: AdminDecisionType;
  label: string;
  description: string;
  color: string;
  icon: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, accent && styles.infoAccent]}>{value}</Text>
    </View>
  );
}

function AttachmentItem({
  name,
  type,
  url,
  onPressImage,
}: {
  name: string;
  type: string;
  url: string;
  onPressImage: (url: string, name: string) => void;
}) {
  const isImage = type.startsWith('image/');

  async function handlePress() {
    if (isImage) {
      onPressImage(url, name);
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Não foi possível abrir', `Tente acessar diretamente:\n${url}`);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o arquivo.');
    }
  }

  return (
    <TouchableOpacity style={styles.attachItem} onPress={handlePress} activeOpacity={0.7}>
      {isImage ? (
        <Image
          source={{ uri: url }}
          style={styles.attachThumb}
          resizeMode="cover"
          onError={() => {}}
        />
      ) : (
        <View style={styles.attachIconWrap}>
          <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
        </View>
      )}
      <View style={styles.attachInfo}>
        <Text style={styles.attachName} numberOfLines={2}>{name}</Text>
        <Text style={styles.attachType}>{type}</Text>
      </View>
      <Ionicons
        name={isImage ? 'expand-outline' : 'open-outline'}
        size={16}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
}

export default function AdminDisputeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dispute, setDispute] = useState<AdminDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<AdminDecisionType | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image viewer state
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);
  const [imageViewerName, setImageViewerName] = useState('');

  const fetchDispute = useCallback(async () => {
    try {
      const { data } = await adminApi.get<AdminDispute>(`/admin/disputes/${id}`);
      setDispute(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível carregar a contestação.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  function openImageViewer(url: string, name: string) {
    setImageViewerUrl(url);
    setImageViewerName(name);
  }

  function closeImageViewer() {
    setImageViewerUrl(null);
    setImageViewerName('');
  }

  async function handleDecision() {
    if (!selectedDecision) return;
    setSubmitting(true);
    try {
      await adminApi.post(`/admin/disputes/${id}/decision`, {
        decision: selectedDecision,
        notes: decisionNotes.trim() || undefined,
      });
      setShowDecisionModal(false);
      setSelectedDecision(null);
      setDecisionNotes('');
      await fetchDispute();
      Alert.alert('Decisão registrada', 'A decisão foi aplicada com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível registrar a decisão.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!dispute) return null;

  const ag = dispute.agreement;
  const statusCfg = DISPUTE_STATUS_CONFIG[dispute.status] ?? DISPUTE_STATUS_CONFIG.OPEN;
  const canDecide = dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED';

  const decisionOptions: DecisionOption[] = [
    {
      decision: 'RELEASE_TO_RECEIVER',
      label: 'Favor ao recebedor',
      description: 'Libera o valor para o recebedor.',
      color: Colors.success,
      icon: 'checkmark-circle-outline',
    },
    {
      decision: 'REFUND_TO_PAYER',
      label: 'Favor ao pagador',
      description: 'Reembolsa o valor ao pagador.',
      color: Colors.error,
      icon: 'arrow-undo-circle-outline',
    },
    {
      decision: 'PROPOSE_RENEGOTIATION',
      label: 'Propor renegociação',
      description: 'Propõe nova data de vencimento (+7 dias).',
      color: Colors.secondary,
      icon: 'refresh-circle-outline',
    },
  ];

  function renderEvidenceList(
    items: DisputeEvidence[] | DisputeResponseEvidence[],
    label: string,
  ) {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.attachSection}>
        <Text style={styles.attachTitle}>{label} ({items.length})</Text>
        {items.map((e) => (
          <AttachmentItem
            key={e.id}
            name={e.fileName}
            type={e.fileType}
            url={e.fileUrl}
            onPressImage={openImageViewer}
          />
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalhes da Contestação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          {dispute.adminDecision && (
            <Text style={styles.decisionLabel}>{DECISION_LABELS[dispute.adminDecision] ?? dispute.adminDecision}</Text>
          )}
        </View>

        {/* Acordo */}
        <Section title="Acordo">
          <View style={styles.card}>
            <InfoRow label="Tipo" value="Acordo" />
            <InfoRow label="Valor" value={formatCurrency(ag.amount)} accent />
            <InfoRow label="Vencimento" value={formatDate(ag.dueDate)} />
            <InfoRow label="Pagador" value={`${ag.payer.name} (${ag.payer.seloKey})`} />
            <InfoRow label="Recebedor" value={`${ag.receiver.name} (${ag.receiver.seloKey})`} />
          </View>
        </Section>

        {/* Contestação */}
        <Section title="Contestação">
          <View style={styles.card}>
            <InfoRow label="Título" value={dispute.title} />
            <InfoRow label="Aberto por" value={`${dispute.openedBy.name} (${dispute.openedBy.seloKey})`} />
            <InfoRow label="Data" value={formatDatetime(dispute.createdAt)} />
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Descrição</Text>
              <Text style={styles.descriptionText}>{dispute.description}</Text>
            </View>
            {renderEvidenceList(dispute.evidences, 'Anexos da contestação')}
          </View>
        </Section>

        {/* Resposta da outra parte */}
        {dispute.responses.length > 0 && (
          <Section title="Resposta da outra parte">
            {dispute.responses.map((r) => (
              <View key={r.id} style={styles.card}>
                <InfoRow label="Respondente" value={r.author.name} />
                <InfoRow label="Data" value={formatDatetime(r.createdAt)} />
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionLabel}>Mensagem</Text>
                  <Text style={styles.descriptionText}>{r.message}</Text>
                </View>
                {renderEvidenceList(r.evidences, 'Anexos da resposta')}
              </View>
            ))}
          </Section>
        )}

        {/* Histórico */}
        {dispute.history.length > 0 && (
          <Section title="Histórico">
            <View style={styles.card}>
              {dispute.history.map((h, idx) => (
                <View key={h.id} style={[styles.historyItem, idx < dispute.history.length - 1 && styles.historyItemBorder]}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyAction}>{h.action}</Text>
                    {h.notes && <Text style={styles.historyNotes} numberOfLines={2}>{h.notes}</Text>}
                    <Text style={styles.historyDate}>{formatDatetime(h.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Blockchain */}
        <Section title="Registro blockchain">
          <TouchableOpacity
            style={styles.blockchainBtn}
            onPress={() => (router as any).push({ pathname: '/blockchain-proof', params: { agreementId: ag.id } })}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.blockchainBtnText}>Ver histórico blockchain do acordo</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </Section>

        {/* Ações */}
        {canDecide && (
          <Section title="Ações administrativas">
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDecisionModal(true)} activeOpacity={0.8}>
              <Ionicons name="hammer-outline" size={20} color={Colors.white} />
              <Text style={styles.actionBtnText}>Registrar decisão</Text>
            </TouchableOpacity>
          </Section>
        )}

        {dispute.adminNotes && (
          <Section title="Notas administrativas">
            <View style={styles.card}>
              <Text style={styles.descriptionText}>{dispute.adminNotes}</Text>
            </View>
          </Section>
        )}

        <View style={{ height: Spacing.xxxxl }} />
      </ScrollView>

      {/* Decision Modal */}
      <Modal visible={showDecisionModal} transparent animationType="slide" onRequestClose={() => setShowDecisionModal(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar decisão</Text>
              <TouchableOpacity onPress={() => { setShowDecisionModal(false); setSelectedDecision(null); setDecisionNotes(''); }}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>Selecione a decisão:</Text>
              {decisionOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.decision}
                  style={[styles.decisionOption, selectedDecision === opt.decision && { borderColor: opt.color, borderWidth: 2 }]}
                  onPress={() => setSelectedDecision(opt.decision)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.decisionIconWrap, { backgroundColor: opt.color + '18' }]}>
                    <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                  </View>
                  <View style={styles.decisionTextWrap}>
                    <Text style={styles.decisionLabel2}>{opt.label}</Text>
                    <Text style={styles.decisionDesc}>{opt.description}</Text>
                  </View>
                  {selectedDecision === opt.decision && (
                    <Ionicons name="checkmark-circle" size={20} color={opt.color} />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalSubtitle, { marginTop: Spacing.lg }]}>Observações (opcional):</Text>
              <TextInput
                style={styles.notesInput}
                value={decisionNotes}
                onChangeText={setDecisionNotes}
                placeholder="Descreva os motivos da decisão..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!selectedDecision || submitting) && styles.submitBtnDisabled]}
                onPress={handleDecision}
                disabled={!selectedDecision || submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Confirmar decisão</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={!!imageViewerUrl} transparent animationType="fade" onRequestClose={closeImageViewer}>
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={closeImageViewer}>
            <Ionicons name="close-circle" size={36} color={Colors.white} />
          </TouchableOpacity>
          {imageViewerUrl && (
            <Image
              source={{ uri: imageViewerUrl }}
              style={styles.imageViewerImg}
              resizeMode="contain"
              onError={() => Alert.alert('Erro', 'Não foi possível carregar a imagem.')}
            />
          )}
          <Text style={styles.imageViewerName} numberOfLines={1}>{imageViewerName}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold, color: Colors.white },

  scroll: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { padding: Spacing.lg },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold },
  decisionLabel: { fontSize: Typography.fontSizeSm, color: Colors.textSecondary, flex: 1 },

  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.sm },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoLabel: { width: 90, fontSize: Typography.fontSizeSm, color: Colors.textSecondary },
  infoValue: { flex: 1, fontSize: Typography.fontSizeSm, color: Colors.text },
  infoAccent: { fontWeight: Typography.fontWeightSemiBold, color: Colors.primary },

  descriptionBox: { marginTop: Spacing.sm, paddingTop: Spacing.sm },
  descriptionLabel: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightSemiBold, color: Colors.textSecondary, marginBottom: Spacing.xs },
  descriptionText: { fontSize: Typography.fontSizeSm, color: Colors.text, lineHeight: 20 },

  // Attachments
  attachSection: { marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  attachTitle: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightSemiBold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  attachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  attachThumb: { width: 44, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.borderLight },
  attachIconWrap: { width: 44, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  attachInfo: { flex: 1 },
  attachName: { fontSize: Typography.fontSizeSm, color: Colors.text, fontWeight: Typography.fontWeightMedium },
  attachType: { fontSize: Typography.fontSizeXs, color: Colors.textLight, marginTop: 2 },

  historyItem: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.md },
  historyItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight, marginBottom: Spacing.md },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 5 },
  historyContent: { flex: 1 },
  historyAction: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightMedium, color: Colors.text },
  historyNotes: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary, marginTop: 2 },
  historyDate: { fontSize: Typography.fontSizeXs, color: Colors.textLight, marginTop: 2 },

  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  actionBtnText: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold, color: Colors.white },

  blockchainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    ...Shadows.sm,
  },
  blockchainBtnText: { flex: 1, fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.primary },

  // Decision Modal
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xxl,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  modalTitle: { fontSize: Typography.fontSizeXl, fontWeight: Typography.fontWeightBold, color: Colors.text },
  modalSubtitle: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.textSecondary, marginBottom: Spacing.sm },

  decisionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  decisionIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  decisionTextWrap: { flex: 1 },
  decisionLabel2: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.text },
  decisionDesc: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary, marginTop: 2 },

  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: Typography.fontSizeSm,
    color: Colors.text,
    minHeight: 80,
    marginBottom: Spacing.lg,
  },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  submitBtnDisabled: { backgroundColor: Colors.textLight },
  submitBtnText: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold, color: Colors.white },

  // Image Viewer
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 48,
    right: Spacing.lg,
    zIndex: 10,
  },
  imageViewerImg: {
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
  },
  imageViewerName: {
    position: 'absolute',
    bottom: 48,
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: Spacing.xxl,
    textAlign: 'center',
  },
});
