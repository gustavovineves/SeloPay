import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { api } from '../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';
import { formatCurrency } from '../src/utils/formatters';

type Params = {
  mode: 'wallet' | 'guarantee';
  depositId?: string;
  agreementId?: string;
  amount: string;
  copyPasteCode: string;
  qrCodeUrl: string;
};

export default function DepositPixScreen() {
  const params = useLocalSearchParams<Params>();
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const amount = parseFloat(params.amount ?? '0');
  const isGuarantee = params.mode === 'guarantee';

  async function handleCopy() {
    await Clipboard.setStringAsync(params.copyPasteCode ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleSimulateConfirm() {
    setConfirming(true);
    try {
      if (isGuarantee) {
        await api.post(`/agreements/${params.agreementId}/simulate-deposit-pix`);
        Alert.alert(
          'Garantia confirmada',
          'O valor foi recebido e reservado como garantia. O acordo está agora ativo.',
          [
            {
              text: 'Ver acordo',
              onPress: () => router.replace(`/agreements/${params.agreementId}`),
            },
          ],
        );
      } else {
        const { data } = await api.post(`/wallet/deposits/${params.depositId}/simulate-confirm`);
        Alert.alert(
          'Depósito confirmado',
          `${formatCurrency(data.amount)} adicionados à sua carteira. Saldo disponível: ${formatCurrency(data.availableBalance)}.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/wallet') }],
        );
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível confirmar o Pix.');
    } finally {
      setConfirming(false);
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
        <View>
          <Text style={styles.headerTitle}>Pix gerado</Text>
          <Text style={styles.headerSub}>
            {isGuarantee ? 'Garantia do acordo' : 'Depósito na carteira'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Aguardando pagamento</Text>
        </View>

        {/* Valor */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Valor</Text>
          <Text style={styles.valueAmount}>{formatCurrency(amount)}</Text>
          {isGuarantee && (
            <Text style={styles.valueHint}>
              O valor ficará guardado como garantia do acordo ao ser confirmado.
            </Text>
          )}
        </View>

        {/* QR Code */}
        <View style={styles.qrCard}>
          <Text style={styles.qrLabel}>QR Code Pix</Text>
          {params.qrCodeUrl ? (
            <Image
              source={{ uri: params.qrCodeUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.qrImage, styles.qrPlaceholder]}>
              <Ionicons name="qr-code-outline" size={80} color={Colors.borderLight} />
            </View>
          )}
          <Text style={styles.qrHint}>Escaneie com o app do seu banco</Text>
        </View>

        {/* Copia e Cola */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <Ionicons name="copy-outline" size={18} color={Colors.primary} />
            <Text style={styles.codeTitle}>Pix Copia e Cola</Text>
          </View>
          <Text style={styles.codeText} numberOfLines={3} selectable>
            {params.copyPasteCode}
          </Text>
          <TouchableOpacity
            style={[styles.copyBtn, copied && styles.copyBtnDone]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Ionicons
              name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
              size={18}
              color={copied ? Colors.success : Colors.primary}
            />
            <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>
              {copied ? 'Código copiado' : 'Copiar código'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Após a confirmação, o valor ficará disponível na sua carteira SeloPay.
        </Text>

        {/* Botão simular */}
        <View style={styles.simulateSection}>
          <Text style={styles.simulateLabel}>Ambiente de demonstração</Text>
          <TouchableOpacity
            style={[styles.simulateBtn, confirming && styles.btnDisabled]}
            onPress={handleSimulateConfirm}
            disabled={confirming}
            activeOpacity={0.85}
          >
            {confirming ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                <Text style={styles.simulateBtnText}>Simular Pix pago</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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

  body: {
    padding: Spacing.xxl,
    gap: Spacing.lg,
    alignItems: 'stretch',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.warning,
  },

  valueCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.lg,
  },
  valueLabel: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: Typography.fontWeightMedium,
  },
  valueAmount: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  valueHint: {
    fontSize: Typography.fontSizeXs,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 16,
  },

  qrCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  qrLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: Radius.md,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.borderLight + '40',
  },
  qrHint: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
  },

  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  codeTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  codeText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 18,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  copyBtn: {
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
  copyBtnDone: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + '40',
  },
  copyBtnText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  copyBtnTextDone: {
    color: Colors.success,
  },

  infoText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },

  simulateSection: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.lg,
    marginTop: Spacing.xs,
  },
  simulateLabel: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    ...Shadows.sm,
  },
  simulateBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },
  btnDisabled: { opacity: 0.45 },
});
