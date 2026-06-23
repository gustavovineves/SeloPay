import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotifications } from '../../src/contexts/NotificationsContext';
import { api } from '../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import {
  formatCurrency,
  formatDate,
  formatDatetime,
  AGREEMENT_STATUS_CONFIG,
} from '../../src/utils/formatters';
import type {
  Agreement,
  AgreementConfirmation,
  Negotiation,
  Wallet,
  VirtualCard,
} from '../../src/types';

interface ResponseAttachment {
  fileName: string;
  fileType: string;
  localUri: string;
}

export default function AgreementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [virtualCard, setVirtualCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [negotiateDate, setNegotiateDate] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAttachments, setResponseAttachments] = useState<ResponseAttachment[]>([]);

  const fetchAgreement = useCallback(async () => {
    try {
      const [agRes, walletRes, cardRes] = await Promise.all([
        api.get<Agreement>(`/agreements/${id}`),
        api.get<Wallet>('/wallet').catch(() => ({ data: null as Wallet | null })),
        api.get<VirtualCard>('/virtual-card/me').catch(() => ({ data: null as VirtualCard | null })),
      ]);
      setAgreement(agRes.data);
      if (walletRes.data) setWalletBalance(walletRes.data.availableBalance);
      setVirtualCard(cardRes.data);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível carregar o acordo.');
    }
  }, [id]);

  useEffect(() => {
    fetchAgreement().finally(() => setLoading(false));
  }, [fetchAgreement]);

  // ─── PENDING_ACCEPTANCE: accept / reject ────────────────────────────────

  function handleAccept() {
    Alert.alert('Aceitar acordo', 'Tem certeza que deseja aceitar este acordo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceitar',
        onPress: async () => {
          setAccepting(true);
          try {
            await api.post(`/agreements/${id}/accept`);
            refreshNotifications().catch(() => {});
            const acceptMsg = `Aguardando depósito de garantia de ${agreement?.payer.name.split(' ')[0] ?? 'pagador'} para ativar o acordo.`;
            Alert.alert('Acordo aceito', acceptMsg, [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err: any) {
            Alert.alert('Erro', err.message ?? 'Não foi possível aceitar o acordo.');
          } finally {
            setAccepting(false);
          }
        },
      },
    ]);
  }

  function handleReject() {
    Alert.alert('Recusar acordo', 'Tem certeza que deseja recusar este acordo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: async () => {
          setRejecting(true);
          try {
            await api.post(`/agreements/${id}/reject`);
            refreshNotifications().catch(() => {});
            Alert.alert('Acordo recusado', 'O acordo foi recusado.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err: any) {
            Alert.alert('Erro', err.message ?? 'Não foi possível recusar o acordo.');
          } finally {
            setRejecting(false);
          }
        },
      },
    ]);
  }

  // ─── WAITING_DEPOSIT: opções de depósito de garantia ──────────────────────

  function handleDepositOptions() {
    setShowDepositModal(true);
  }

  async function handleDepositFromWallet() {
    if (!agreement) return;
    setShowDepositModal(false);
    setSubmitting(true);
    try {
      await api.post(`/agreements/${id}/simulate-deposit`);
      await fetchAgreement();
      refreshNotifications().catch(() => {});
      Alert.alert('Depósito realizado', 'O valor foi guardado como garantia. O acordo está agora ativo.');
    } catch (err: any) {
      const isSaldoInsuf = (err.message ?? '').includes('Saldo insuficiente');
      if (isSaldoInsuf) {
        Alert.alert(
          'Saldo insuficiente',
          `${err.message}\n\nVocê pode depositar via Pix para garantir este acordo.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Depositar via Pix',
              onPress: () => handleDepositViaPix(),
            },
          ],
        );
      } else {
        Alert.alert('Erro', err.message ?? 'Não foi possível realizar o depósito.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDepositViaCard() {
    if (!agreement) return;
    setShowDepositModal(false);
    setSubmitting(true);
    try {
      await api.post(`/agreements/${id}/simulate-deposit-card`);
      await fetchAgreement();
      refreshNotifications().catch(() => {});
      Alert.alert('Depósito realizado', 'O limite do cartão foi reservado. O acordo está agora ativo.');
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível usar o cartão como garantia.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDepositViaPix() {
    if (!agreement) return;
    setShowDepositModal(false);
    router.push({
      pathname: '/deposit-pix',
      params: {
        mode: 'guarantee',
        agreementId: id,
        amount: String(agreement.amount),
        copyPasteCode: agreement.simulatedPayment?.fakePixCode ?? '',
        qrCodeUrl: agreement.simulatedPayment?.fakeQrCode ?? '',
      },
    });
  }

  // ─── ACTIVE: confirmações ───────────────────────────────────────────────

  function handleConfirmPayment() {
    const confirmationType = 'OBLIGATION_FULFILLED' as const;
    const title = 'Confirmar cumprimento';
    const body = 'Confirme que você cumpriu sua parte do acordo. O valor será liberado após a confirmação do recebedor.';
    const successTitle = 'Cumprimento confirmado';
    const successBody = 'Confirmação registrada. Aguardando confirmação do recebedor para liberar o valor.';

    Alert.alert(title, body, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setSubmitting(true);
          try {
            await api.post(`/agreements/${id}/confirm`, { confirmationType });
            await fetchAgreement();
            refreshNotifications().catch(() => {});
            Alert.alert(successTitle, successBody);
          } catch (err: any) {
            Alert.alert('Erro', err.message ?? 'Não foi possível confirmar.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  }

  function handleConfirmReceipt() {
    const confirmationType = 'READY_TO_RECEIVE' as const;
    const title = 'Confirmar liberação';
    const body = 'Confirme que o pagador cumpriu o acordo. O valor guardado será liberado para você.';
    const successTitle = 'Valor liberado';
    const successBody = 'Confirmação registrada. Aguardando confirmação do pagador para liberar o valor.';

    Alert.alert(title, body, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setSubmitting(true);
          try {
            await api.post(`/agreements/${id}/confirm`, { confirmationType });
            await fetchAgreement();
            refreshNotifications().catch(() => {});
            Alert.alert(successTitle, successBody, [{ text: 'OK', onPress: () => router.back() }]);
          } catch (err: any) {
            Alert.alert('Erro', err.message ?? 'Não foi possível confirmar.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  }

  // ─── Contestação ────────────────────────────────────────────────────────

  async function handleSubmitDispute() {
    if (disputeTitle.trim().length < 5) {
      Alert.alert('Atenção', 'O título deve ter pelo menos 5 caracteres.');
      return;
    }
    if (disputeDesc.trim().length < 10) {
      Alert.alert('Atenção', 'A descrição deve ter pelo menos 10 caracteres.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/disputes', {
        agreementId: id,
        title: disputeTitle.trim(),
        description: disputeDesc.trim(),
      });
      setShowDisputeModal(false);
      setDisputeTitle('');
      setDisputeDesc('');
      await fetchAgreement();
      refreshNotifications().catch(() => {});
      Alert.alert(
        'Contestação aberta',
        'Sua contestação foi registrada. A administração irá analisar o caso.',
      );
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível abrir a contestação.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Renegociação ───────────────────────────────────────────────────────

  async function handleSubmitNegotiate() {
    const parts = negotiateDate.trim().split('/');
    if (parts.length !== 3) {
      Alert.alert('Atenção', 'Informe a data no formato DD/MM/AAAA.');
      return;
    }
    const [day, month, year] = parts;
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00.000Z`;
    const parsed = new Date(iso);
    if (isNaN(parsed.getTime()) || parsed <= new Date()) {
      Alert.alert('Atenção', 'Informe uma data futura válida no formato DD/MM/AAAA.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/agreements/${id}/negotiate`, { proposedDueDate: parsed.toISOString() });
      setShowNegotiateModal(false);
      setNegotiateDate('');
      await fetchAgreement();
      refreshNotifications().catch(() => {});
      Alert.alert('Proposta enviada', 'Sua proposta de renegociação foi enviada. A outra parte deverá responder.');
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível propor a renegociação.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleAcceptNegotiation(neg: Negotiation) {
    Alert.alert(
      'Aceitar renegociação',
      `Aceitar nova data de vencimento: ${formatDate(neg.proposedDueDate)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            setSubmitting(true);
            try {
              await api.post(`/agreements/${id}/negotiate/accept`);
              await fetchAgreement();
              refreshNotifications().catch(() => {});
              Alert.alert('Renegociação aceita', 'A nova data de vencimento foi aplicada ao acordo.');
            } catch (err: any) {
              Alert.alert('Erro', err.message ?? 'Não foi possível aceitar a renegociação.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  }

  function handleRejectNegotiation() {
    Alert.alert(
      'Negar renegociação',
      'A proposta será recusada e o acordo voltará à data original.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Negar',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              await api.post(`/agreements/${id}/negotiate/reject`);
              await fetchAgreement();
              refreshNotifications().catch(() => {});
              Alert.alert('Renegociação negada', 'A proposta foi recusada. O acordo continua com a data original.');
            } catch (err: any) {
              Alert.alert('Erro', err.message ?? 'Não foi possível negar a renegociação.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  }

  // ─── Resposta à contestação ─────────────────────────────────────────────

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para anexar imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `imagem_${Date.now()}.jpg`;
      const fileType = (asset.mimeType ?? 'image/jpeg') as string;
      setResponseAttachments((prev) => [...prev, { fileName, fileType, localUri: asset.uri }]);
    }
  }

  async function handlePickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setResponseAttachments((prev) => [
        ...prev,
        { fileName: asset.name, fileType: asset.mimeType ?? 'application/pdf', localUri: asset.uri },
      ]);
    }
  }

  function removeAttachment(index: number) {
    setResponseAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitResponse() {
    if (responseMessage.trim().length < 10) {
      Alert.alert('Atenção', 'A mensagem deve ter pelo menos 10 caracteres.');
      return;
    }
    const currentDispute = agreement?.disputes?.[0];
    if (!currentDispute) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', responseMessage.trim());
      for (const att of responseAttachments) {
        formData.append('files', {
          uri: att.localUri,
          name: att.fileName,
          type: att.fileType,
        } as any);
      }
      await api.post(`/disputes/${currentDispute.id}/respond`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowResponseModal(false);
      setResponseMessage('');
      setResponseAttachments([]);
      await fetchAgreement();
      refreshNotifications().catch(() => {});
      Alert.alert(
        'Resposta enviada',
        'A administração irá analisar as informações das duas partes.',
      );
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível enviar a resposta.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Loading / not found ────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HeaderBar />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!agreement) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HeaderBar />
        <View style={styles.loadingBox}>
          <Text style={styles.notFoundText}>Acordo não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Valores derivados ──────────────────────────────────────────────────

  const statusCfg = AGREEMENT_STATUS_CONFIG[agreement.status];
  const isPayer = agreement.payerId === user?.id;
  const isReceiver = agreement.receiverId === user?.id;

  const canRespondToAgreement = isReceiver && agreement.status === 'PENDING_ACCEPTANCE';
  const isWaitingForReceiver = isPayer && agreement.status === 'PENDING_ACCEPTANCE';
  const isActive = agreement.status === 'ACTIVE';
  const isInNegotiation = agreement.status === 'IN_NEGOTIATION';
  const isInDispute = agreement.status === 'IN_DISPUTE';

  const confirmations: AgreementConfirmation[] = agreement.confirmations ?? [];
  const payerConfirmed = confirmations.some((c) => c.role === 'PAYER');
  const receiverConfirmed = confirmations.some((c) => c.role === 'RECEIVER');

  const negotiations: Negotiation[] = agreement.negotiations ?? [];
  const latestNeg = negotiations.find((n) => n.status === 'PENDING') ?? negotiations[0] ?? null;
  const isNegProposer = latestNeg?.proposedById === user?.id;
  const canAcceptNeg = isInNegotiation && latestNeg?.status === 'PENDING' && !isNegProposer;

  const anyBusy = accepting || rejecting || submitting;

  const currentDispute = agreement.disputes?.[0] ?? null;
  const isDisputeOpener = currentDispute?.openedById === user?.id;
  const hasResponded = currentDispute?.responses?.some((r) => r.authorId === user?.id) ?? false;
  const canRespond = isInDispute && !!currentDispute && !isDisputeOpener && !hasResponded;
  const disputeUnderReview = currentDispute?.status === 'UNDER_REVIEW';

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.headerTitle}>Detalhe do Acordo</Text>
          <Text style={styles.headerSubtitle}>
            {'Acordo'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusBannerText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>

        {/* ── Recebedor precisa aceitar/recusar ──────────────────────── */}
        {canRespondToAgreement && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="alert-circle-outline" size={22} color={Colors.warning} />
              <Text style={styles.actionCardTitle}>Resposta necessária</Text>
            </View>
            <Text style={styles.actionCardDesc}>
              {agreement.payer.name.split(' ')[0]} enviou um acordo para você. Aceite ou recuse abaixo.
            </Text>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={[styles.acceptBtn, anyBusy && styles.btnDisabled]}
                onPress={handleAccept}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                {accepting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                    <Text style={styles.acceptBtnText}>Aceitar acordo</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectBtn, anyBusy && styles.btnDisabled]}
                onPress={handleReject}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                {rejecting ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                    <Text style={styles.rejectBtnText}>Recusar acordo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Pagador aguarda aceite ─────────────────────────────────── */}
        {isWaitingForReceiver && (
          <View style={styles.waitingCard}>
            <Ionicons name="time-outline" size={20} color={Colors.warning} />
            <Text style={styles.waitingText}>
              Aguardando confirmação de {agreement.receiver.name.split(' ')[0]}
            </Text>
          </View>
        )}

        {/* ── WAITING_DEPOSIT: pagador deposita garantia ────────────── */}
        {agreement.status === 'WAITING_DEPOSIT' && isPayer && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.primary} />
              <Text style={styles.actionCardTitle}>Depósito de garantia</Text>
            </View>
            <Text style={styles.actionCardDesc}>
              {agreement.receiver.name.split(' ')[0]} aceitou o acordo. Deposite o valor de garantia
              para ativar o acordo. O valor ficará guardado pela SeloPay até a conclusão.
            </Text>
            {walletBalance !== null && walletBalance < agreement.amount && (
              <View style={styles.balanceWarnBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
                <Text style={styles.balanceWarnText}>
                  Saldo disponível: {formatCurrency(walletBalance)}. Use Pix para depositar.
                </Text>
              </View>
            )}
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={[styles.acceptBtn, anyBusy && styles.btnDisabled]}
                onPress={handleDepositOptions}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="arrow-down-circle-outline" size={20} color={Colors.white} />
                    <Text style={styles.acceptBtnText}>
                      Depositar {formatCurrency(agreement.amount)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── WAITING_DEPOSIT: recebedor aguarda depósito ───────────── */}
        {agreement.status === 'WAITING_DEPOSIT' && isReceiver && (
          <View style={styles.waitingCard}>
            <Ionicons name="time-outline" size={20} color={Colors.warning} />
            <Text style={styles.waitingText}>
              Aguardando depósito de garantia de {agreement.payer.name.split(' ')[0]}
            </Text>
          </View>
        )}

        {/* ── Ações para o PAGADOR quando ATIVO ─────────────────────── */}
        {isActive && isPayer && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="clipboard-outline" size={22} color={Colors.primary} />
              <Text style={styles.actionCardTitle}>Ações do acordo</Text>
            </View>

            {payerConfirmed ? (
              <View style={styles.confirmedBox}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.confirmedText}>
                  {`Cumprimento confirmado. Aguardando confirmação de ${agreement.receiver.name.split(' ')[0]} para liberar o valor.`}
                </Text>
              </View>
            ) : (
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={[styles.acceptBtn, anyBusy && styles.btnDisabled]}
                  onPress={handleConfirmPayment}
                  disabled={anyBusy}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                      <Text style={styles.acceptBtnText}>
                        {'Cumpri o acordo'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.secondaryBtns}>
              <TouchableOpacity
                style={[styles.secondaryBtn, anyBusy && styles.btnDisabled]}
                onPress={() => setShowNegotiateModal(true)}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={15} color={Colors.primary} />
                <Text style={styles.secondaryBtnText}>Solicitar renegociação</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.disputeBtn, anyBusy && styles.btnDisabled]}
                onPress={() => setShowDisputeModal(true)}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                <Ionicons name="flag-outline" size={15} color={Colors.error} />
                <Text style={styles.disputeBtnText}>Contestar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Ações para o RECEBEDOR quando ATIVO ───────────────────── */}
        {isActive && isReceiver && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="clipboard-outline" size={22} color={Colors.primary} />
              <Text style={styles.actionCardTitle}>Ações do acordo</Text>
            </View>
            <Text style={styles.actionCardDesc}>
              {`Confirme que ${agreement.payer.name.split(' ')[0]} cumpriu o acordo para liberar o valor garantido.`}
            </Text>

            {receiverConfirmed ? (
              <View style={styles.confirmedBox}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.confirmedText}>
                  {'Liberação confirmada. Aguardando confirmação do pagador.'}
                </Text>
              </View>
            ) : (
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={[styles.acceptBtn, anyBusy && styles.btnDisabled]}
                  onPress={handleConfirmReceipt}
                  disabled={anyBusy}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="cash-outline" size={20} color={Colors.white} />
                      <Text style={styles.acceptBtnText}>
                        {'Confirmar liberação'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, anyBusy && styles.btnDisabled]}
                  onPress={() => setShowDisputeModal(true)}
                  disabled={anyBusy}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                  <Text style={styles.rejectBtnText}>Não recebi / Contestar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.secondaryBtns}>
              <TouchableOpacity
                style={[styles.secondaryBtn, anyBusy && styles.btnDisabled]}
                onPress={() => setShowNegotiateModal(true)}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={15} color={Colors.primary} />
                <Text style={styles.secondaryBtnText}>Solicitar renegociação</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Renegociação em andamento ──────────────────────────────── */}
        {isInNegotiation && latestNeg && (
          <View style={styles.negotiationCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="refresh-circle-outline" size={22} color={Colors.warning} />
              <Text style={styles.actionCardTitle}>Renegociação em andamento</Text>
            </View>
            <Text style={styles.actionCardDesc}>
              Nova data proposta:{' '}
              <Text style={styles.bold}>{formatDate(latestNeg.proposedDueDate)}</Text>
            </Text>
            <Text style={styles.actionCardDesc}>
              Proposto por:{' '}
              {latestNeg.proposedById === agreement.payerId
                ? agreement.payer.name.split(' ')[0]
                : agreement.receiver.name.split(' ')[0]}
            </Text>

            {isNegProposer ? (
              <View style={styles.waitingCard}>
                <Ionicons name="time-outline" size={16} color={Colors.warning} />
                <Text style={styles.waitingText}>Aguardando resposta da outra parte</Text>
              </View>
            ) : (
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={[styles.acceptBtn, anyBusy && styles.btnDisabled]}
                  onPress={() => handleAcceptNegotiation(latestNeg)}
                  disabled={anyBusy}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                      <Text style={styles.acceptBtnText}>Aceitar renegociação</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, anyBusy && styles.btnDisabled]}
                  onPress={handleRejectNegotiation}
                  disabled={anyBusy}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                  <Text style={styles.rejectBtnText}>Negar renegociação</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Disputa: visão do autor da contestação ─────────────────── */}
        {isInDispute && isDisputeOpener && (
          <View style={styles.disputeInfoCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="warning-outline" size={22} color={Colors.error} />
              <Text style={[styles.actionCardTitle, { color: Colors.error }]}>
                Contestação em andamento
              </Text>
            </View>
            <Text style={styles.actionCardDesc}>
              {disputeUnderReview
                ? 'A outra parte enviou uma resposta. A administração irá analisar as informações e tomar uma decisão.'
                : 'Sua contestação foi registrada. Aguardando resposta da outra parte e análise da administração.'}
            </Text>
          </View>
        )}

        {/* ── Disputa: card "Responder contestação" ──────────────────── */}
        {canRespond && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="chatbox-outline" size={22} color={Colors.primary} />
              <Text style={styles.actionCardTitle}>Responder contestação</Text>
            </View>
            <Text style={styles.actionCardDesc}>
              {agreement.payer.id === currentDispute?.openedById
                ? agreement.payer.name.split(' ')[0]
                : agreement.receiver.name.split(' ')[0]}{' '}
              abriu uma contestação. Envie sua versão dos fatos e, se necessário, anexe comprovantes.
            </Text>
            <TouchableOpacity
              style={[styles.acceptBtn, anyBusy && styles.btnDisabled]}
              onPress={() => setShowResponseModal(true)}
              disabled={anyBusy}
              activeOpacity={0.8}
            >
              <Ionicons name="send-outline" size={18} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Enviar resposta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Disputa: resposta já enviada / em análise ──────────────── */}
        {isInDispute && !isDisputeOpener && hasResponded && (
          <View style={styles.underReviewCard}>
            <View style={styles.actionCardHeader}>
              <Ionicons name="hourglass-outline" size={22} color={Colors.primary} />
              <Text style={[styles.actionCardTitle, { color: Colors.primary }]}>Em análise</Text>
            </View>
            <Text style={styles.actionCardDesc}>
              Sua resposta foi enviada. A administração irá analisar as informações das duas partes
              e tomar uma decisão.
            </Text>
            {currentDispute?.responses?.[0] && (
              <View style={styles.responseSentBox}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.responseSentText} numberOfLines={3}>
                  "{currentDispute.responses[0].message}"
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Partes ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partes envolvidas</Text>
          <View style={styles.partiesCard}>
            <PartyRow
              label="Pagador"
              name={agreement.payer.name}
              seloKey={agreement.payer.seloKey}
              isYou={isPayer}
              icon="arrow-up-circle-outline"
              color={Colors.warning}
            />
            <View style={styles.divider} />
            <PartyRow
              label="Recebedor"
              name={agreement.receiver.name}
              seloKey={agreement.receiver.seloKey}
              isYou={isReceiver}
              icon="arrow-down-circle-outline"
              color={Colors.success}
            />
          </View>
        </View>

        {/* ── Detalhes ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.detailsCard}>
            <DetailRow
              icon="cash-outline"
              label="Valor combinado"
              value={formatCurrency(agreement.amount)}
              highlight
            />
            <DetailRow
              icon="calendar-outline"
              label="Data de vencimento"
              value={formatDate(agreement.dueDate)}
            />
            <DetailRow
              icon="shield-checkmark-outline"
              label="Tipo de acordo"
              value="Acordo"
              last
            />
          </View>
        </View>

        {/* ── Histórico ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <View style={styles.detailsCard}>
            <DetailRow
              icon="time-outline"
              label="Criado em"
              value={formatDatetime(agreement.createdAt)}
            />
            {agreement.acceptedAt ? (
              <DetailRow
                icon="checkmark-circle-outline"
                label="Aceito em"
                value={formatDatetime(agreement.acceptedAt)}
              />
            ) : (
              <DetailRow
                icon="hourglass-outline"
                label="Expira em"
                value={formatDatetime(agreement.expiresAt)}
              />
            )}
            {payerConfirmed && (
              <DetailRow
                icon="checkmark-outline"
                label="Pagador confirmou"
                value="Pagamento confirmado"
              />
            )}
            {receiverConfirmed && (
              <DetailRow
                icon="cash-outline"
                label="Recebedor confirmou"
                value="Recebimento confirmado"
              />
            )}
            {agreement.completedAt ? (
              <DetailRow
                icon="trophy-outline"
                label="Concluído em"
                value={formatDatetime(agreement.completedAt)}
                last
              />
            ) : (
              <View style={{ height: 0 }} />
            )}
          </View>
        </View>

        {/* ── Blockchain ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registro no blockchain</Text>
          <TouchableOpacity
            style={styles.blockchainCard}
            onPress={() => (router as any).push({ pathname: '/blockchain-proof', params: { agreementId: id } })}
            activeOpacity={0.8}
          >
            <View style={styles.blockchainIcon}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.blockchainTitle}>Ver histórico protegido</Text>
              <Text style={styles.blockchainDesc}>
                Cada evento deste acordo está registrado com hash criptográfico SHA-256.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modal: Opções de depósito de garantia ────────────────────── */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="fade"
        onRequestClose={() => !anyBusy && setShowDepositModal(false)}
      >
        <View style={m.overlay}>
          <View style={m.card}>
            <View style={m.cardHeader}>
              <Text style={m.cardTitle}>Depositar garantia</Text>
              <TouchableOpacity
                onPress={() => !anyBusy && setShowDepositModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={anyBusy}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={m.fieldLabel}>
              Escolha como depositar {agreement ? formatCurrency(agreement.amount) : ''} como garantia:
            </Text>

            {walletBalance !== null && walletBalance >= (agreement?.amount ?? Infinity) ? (
              <TouchableOpacity
                style={[m.depositOption, anyBusy && m.btnDis]}
                onPress={handleDepositFromWallet}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                <View style={m.depositOptionIcon}>
                  <Ionicons name="wallet-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={m.depositOptionTitle}>Usar saldo da carteira</Text>
                  <Text style={m.depositOptionDesc}>
                    Disponível: {formatCurrency(walletBalance)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ) : (
              <View style={[m.depositOption, m.depositOptionDisabled]}>
                <View style={m.depositOptionIcon}>
                  <Ionicons name="wallet-outline" size={22} color={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[m.depositOptionTitle, { color: Colors.textLight }]}>
                    Usar saldo da carteira
                  </Text>
                  <Text style={m.depositOptionDesc}>
                    Saldo insuficiente ({walletBalance !== null ? formatCurrency(walletBalance) : '—'})
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[m.depositOption, m.depositOptionPix, anyBusy && m.btnDis]}
              onPress={handleDepositViaPix}
              disabled={anyBusy}
              activeOpacity={0.8}
            >
              <View style={[m.depositOptionIcon, { backgroundColor: Colors.secondary + '15' }]}>
                <Ionicons name="qr-code-outline" size={22} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[m.depositOptionTitle, { color: Colors.secondary }]}>
                  Depositar via Pix
                </Text>
                <Text style={m.depositOptionDesc}>
                  Transfira de qualquer banco. Recomendado.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
            </TouchableOpacity>

            {virtualCard?.status === 'ACTIVE' &&
              (virtualCard.creditLimit - virtualCard.usedLimit) >= (agreement?.amount ?? Infinity) ? (
              <TouchableOpacity
                style={[m.depositOption, m.depositOptionCard, anyBusy && m.btnDis]}
                onPress={handleDepositViaCard}
                disabled={anyBusy}
                activeOpacity={0.8}
              >
                <View style={[m.depositOptionIcon, { backgroundColor: '#5C6BC015' }]}>
                  <Ionicons name="card-outline" size={22} color="#5C6BC0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[m.depositOptionTitle, { color: '#5C6BC0' }]}>
                    Usar Cartão SeloPay
                  </Text>
                  <Text style={m.depositOptionDesc}>
                    Disponível: {formatCurrency(virtualCard.creditLimit - virtualCard.usedLimit)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#5C6BC0" />
              </TouchableOpacity>
            ) : virtualCard?.status === 'ACTIVE' ? (
              <View style={[m.depositOption, m.depositOptionDisabled]}>
                <View style={m.depositOptionIcon}>
                  <Ionicons name="card-outline" size={22} color={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[m.depositOptionTitle, { color: Colors.textLight }]}>
                    Usar Cartão SeloPay
                  </Text>
                  <Text style={m.depositOptionDesc}>
                    Limite insuficiente ({formatCurrency(virtualCard.creditLimit - virtualCard.usedLimit)})
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ── Modal: Contestação ────────────────────────────────────────── */}
      <Modal
        visible={showDisputeModal}
        transparent
        animationType="fade"
        onRequestClose={() => !submitting && setShowDisputeModal(false)}
      >
        <KeyboardAvoidingView
          style={m.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={m.card}>
            <View style={m.cardHeader}>
              <Text style={m.cardTitle}>Abrir contestação</Text>
              <TouchableOpacity
                onPress={() => !submitting && setShowDisputeModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={submitting}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={m.fieldLabel}>Título</Text>
            <TextInput
              style={m.input}
              placeholder="Descreva o problema resumidamente"
              placeholderTextColor={Colors.textLight}
              value={disputeTitle}
              onChangeText={setDisputeTitle}
              maxLength={200}
              editable={!submitting}
            />

            <Text style={m.fieldLabel}>Descrição</Text>
            <TextInput
              style={[m.input, m.inputMulti]}
              placeholder="Detalhe o que aconteceu e por que está contestando"
              placeholderTextColor={Colors.textLight}
              value={disputeDesc}
              onChangeText={setDisputeDesc}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
            />

            <TouchableOpacity
              style={[
                m.submitBtn,
                m.submitBtnError,
                (!disputeTitle.trim() || !disputeDesc.trim() || submitting) && m.btnDis,
              ]}
              onPress={handleSubmitDispute}
              disabled={!disputeTitle.trim() || !disputeDesc.trim() || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={m.submitBtnText}>Enviar contestação</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: Resposta à contestação ───────────────────────────── */}
      <Modal
        visible={showResponseModal}
        transparent
        animationType="fade"
        onRequestClose={() => !submitting && setShowResponseModal(false)}
      >
        <KeyboardAvoidingView
          style={m.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[m.card, { maxHeight: '90%', padding: 0 }]}>
            <ScrollView
              contentContainerStyle={m.scrollCard}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={m.cardHeader}>
                <Text style={m.cardTitle}>Responder contestação</Text>
                <TouchableOpacity
                  onPress={() => !submitting && setShowResponseModal(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  disabled={submitting}
                >
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={m.fieldLabel}>Mensagem</Text>
              <TextInput
                style={[m.input, m.inputMulti]}
                placeholder="Descreva sua versão dos fatos e apresente seus argumentos"
                placeholderTextColor={Colors.textLight}
                value={responseMessage}
                onChangeText={setResponseMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!submitting}
              />

              <Text style={m.fieldLabel}>Anexos (opcional)</Text>
              <View style={m.attachBtns}>
                <TouchableOpacity
                  style={[m.attachBtn, submitting && m.btnDis]}
                  onPress={handlePickImage}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Ionicons name="image-outline" size={18} color={Colors.primary} />
                  <Text style={m.attachBtnText}>Imagem</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[m.attachBtn, submitting && m.btnDis]}
                  onPress={handlePickDocument}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-outline" size={18} color={Colors.primary} />
                  <Text style={m.attachBtnText}>Arquivo</Text>
                </TouchableOpacity>
              </View>

              {responseAttachments.length > 0 && (
                <View style={m.attachList}>
                  {responseAttachments.map((att, idx) => (
                    <View key={idx} style={m.attachItem}>
                      <Ionicons
                        name={att.fileType.startsWith('image/') ? 'image-outline' : 'document-text-outline'}
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={m.attachName} numberOfLines={1}>{att.fileName}</Text>
                      <TouchableOpacity
                        onPress={() => removeAttachment(idx)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        disabled={submitting}
                      >
                        <Ionicons name="close-circle" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[
                  m.submitBtn,
                  (!responseMessage.trim() || submitting) && m.btnDis,
                ]}
                onPress={handleSubmitResponse}
                disabled={!responseMessage.trim() || submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={m.submitBtnText}>Enviar resposta</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: Renegociação ───────────────────────────────────────── */}
      <Modal
        visible={showNegotiateModal}
        transparent
        animationType="fade"
        onRequestClose={() => !submitting && setShowNegotiateModal(false)}
      >
        <KeyboardAvoidingView
          style={m.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={m.card}>
            <View style={m.cardHeader}>
              <Text style={m.cardTitle}>Solicitar renegociação</Text>
              <TouchableOpacity
                onPress={() => !submitting && setShowNegotiateModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={submitting}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={m.fieldLabel}>Nova data de vencimento</Text>
            <TextInput
              style={m.input}
              placeholder="DD/MM/AAAA (ex: 20/07/2026)"
              placeholderTextColor={Colors.textLight}
              value={negotiateDate}
              onChangeText={setNegotiateDate}
              keyboardType="default"
              maxLength={10}
              editable={!submitting}
            />
            <Text style={m.hint}>
              A data deve ser futura. A outra parte deverá aceitar a proposta para que o acordo seja
              atualizado.
            </Text>

            <TouchableOpacity
              style={[m.submitBtn, (!negotiateDate.trim() || submitting) && m.btnDis]}
              onPress={handleSubmitNegotiate}
              disabled={!negotiateDate.trim() || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={m.submitBtnText}>Propor renegociação</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function HeaderBar() {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detalhe do Acordo</Text>
    </View>
  );
}

function PartyRow({
  label,
  name,
  seloKey,
  isYou,
  icon,
  color,
}: {
  label: string;
  name: string;
  seloKey: string;
  isYou: boolean;
  icon: string;
  color: string;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
  return (
    <View style={pRow.row}>
      <View style={[pRow.avatar, { backgroundColor: color + '18' }]}>
        <Text style={[pRow.initials, { color }]}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={pRow.nameRow}>
          <Text style={pRow.label}>{label}</Text>
          {isYou && (
            <View style={pRow.youBadge}>
              <Text style={pRow.youText}>Você</Text>
            </View>
          )}
        </View>
        <Text style={pRow.name}>{name}</Text>
        <Text style={pRow.seloKey}>{seloKey}</Text>
      </View>
      <Ionicons name={icon as any} size={22} color={color} />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  highlight,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[dRow.row, last && dRow.rowLast]}>
      <View style={dRow.iconWrap}>
        <Ionicons name={icon as any} size={15} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={dRow.label}>{label}</Text>
        <Text style={[dRow.value, highlight && dRow.valueHL]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const pRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    fontWeight: Typography.fontWeightMedium,
  },
  youBadge: {
    backgroundColor: Colors.primary + '15',
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  youText: {
    fontSize: 10,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  name: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  seloKey: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
});

const dRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    fontWeight: Typography.fontWeightMedium,
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.fontSizeMd,
    color: Colors.text,
    fontWeight: Typography.fontWeightMedium,
  },
  valueHL: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
  },

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

  scroll: {
    padding: Spacing.xxl,
    gap: Spacing.lg,
  },

  statusBanner: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
  },

  // ── Cards de ação ──────────────────────────────────────────────────────
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1.5,
    borderColor: Colors.warning + '40',
    gap: Spacing.md,
    ...Shadows.md,
  },
  negotiationCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1.5,
    borderColor: Colors.warning + '60',
    gap: Spacing.md,
    ...Shadows.md,
  },
  disputeInfoCard: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1.5,
    borderColor: Colors.error + '50',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionCardTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  actionCardDesc: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bold: { fontWeight: Typography.fontWeightBold },

  // ── Botões primários ───────────────────────────────────────────────────
  actionBtns: {
    flexDirection: 'column',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  acceptBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.error + '70',
    overflow: 'hidden',
  },
  rejectBtnText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.error,
  },
  btnDisabled: { opacity: 0.45 },

  // ── Botões secundários ─────────────────────────────────────────────────
  secondaryBtns: {
    flexDirection: 'column',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  secondaryBtnText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '50',
  },
  disputeBtnText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.error,
  },

  // ── Estados ────────────────────────────────────────────────────────────
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  waitingText: {
    flex: 1,
    fontSize: Typography.fontSizeSm,
    color: Colors.warning,
    fontWeight: Typography.fontWeightMedium,
  },
  confirmedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  confirmedText: {
    flex: 1,
    fontSize: Typography.fontSizeSm,
    color: Colors.success,
    fontWeight: Typography.fontWeightMedium,
    lineHeight: 20,
  },

  // ── Aviso de saldo insuficiente ───────────────────────────────────────
  balanceWarnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  balanceWarnText: {
    flex: 1,
    fontSize: Typography.fontSizeXs,
    color: Colors.warning,
    fontWeight: Typography.fontWeightMedium,
    lineHeight: 16,
  },

  // ── Cards de disputa estendidos ────────────────────────────────────────
  underReviewCard: {
    backgroundColor: Colors.primary + '08',
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  responseSentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  responseSentText: {
    flex: 1,
    fontSize: Typography.fontSizeSm,
    color: Colors.success,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // ── Seções ─────────────────────────────────────────────────────────────
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },

  // ── Blockchain ─────────────────────────────────────────────────────────
  blockchainCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  blockchainIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockchainTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  blockchainDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  partiesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
});

// ── Estilos dos modais ────────────────────────────────────────────────────────

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    width: '100%',
    gap: Spacing.md,
    ...Shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  fieldLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizeMd,
    color: Colors.text,
  },
  inputMulti: {
    minHeight: 96,
    paddingTop: Spacing.sm,
  },
  hint: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  submitBtnError: {
    backgroundColor: Colors.error,
  },
  submitBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },
  btnDis: { opacity: 0.45 },

  scrollCard: {
    padding: Spacing.xxl,
    gap: Spacing.md,
  },

  attachBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  attachBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  attachBtnText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  attachList: {
    gap: Spacing.xs,
  },
  attachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  attachName: {
    flex: 1,
    fontSize: Typography.fontSizeXs,
    color: Colors.text,
  },

  depositOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  depositOptionDisabled: {
    borderColor: Colors.borderLight,
    opacity: 0.6,
  },
  depositOptionPix: {
    borderColor: Colors.secondary + '50',
    backgroundColor: Colors.secondary + '06',
  },
  depositOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositOptionTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  depositOptionDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
  depositOptionCard: {
    borderColor: '#5C6BC050',
    backgroundColor: '#5C6BC006',
  },
});
