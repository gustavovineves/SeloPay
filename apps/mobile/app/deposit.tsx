import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';
import type { PixDeposit } from '../src/types';

export default function DepositScreen() {
  const [rawAmount, setRawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseFloat(rawAmount.replace(',', '.'));
  const isValid = !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= 10000;

  async function handleGeneratePix() {
    if (!isValid) return;
    setLoading(true);
    try {
      const { data } = await api.post<PixDeposit>('/wallet/deposits/pix', { amount: numericAmount });
      router.push({
        pathname: '/deposit-pix',
        params: {
          mode: 'wallet',
          depositId: data.id,
          amount: String(numericAmount),
          copyPasteCode: data.copyPasteCode,
          qrCodeUrl: data.qrCodePayload,
        },
      });
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível gerar o Pix.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Depositar</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Valor do depósito</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>R$</Text>
              <TextInput
                style={styles.amountInput}
                value={rawAmount}
                onChangeText={setRawAmount}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={Colors.textLight}
                maxLength={10}
                autoFocus
              />
            </View>
            {rawAmount.length > 0 && !isValid && (
              <Text style={styles.inputError}>
                {numericAmount > 10000 ? 'Máximo R$ 10.000 por depósito' : 'Informe um valor válido'}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Forma de depósito</Text>
            <View style={styles.methodCard}>
              <View style={styles.methodIcon}>
                <Ionicons name="qr-code-outline" size={26} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodName}>Pix</Text>
                <Text style={styles.methodDesc}>
                  Transfira de qualquer banco. Confirmação instantânea.
                </Text>
              </View>
              <View style={styles.methodCheck}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              </View>
            </View>
          </View>

          <Text style={styles.hint}>
            O valor ficará disponível na sua carteira SeloPay após a confirmação do Pix.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, (!isValid || loading) && styles.btnDisabled]}
            onPress={handleGeneratePix}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="qr-code-outline" size={20} color={Colors.white} />
                <Text style={styles.primaryBtnText}>Gerar Pix</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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

  body: {
    padding: Spacing.xxl,
    gap: Spacing.xl,
  },

  amountCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  amountLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currency: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.text,
  },
  inputError: {
    fontSize: Typography.fontSizeXs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },

  section: { gap: Spacing.sm },
  sectionLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },

  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  methodCheck: {
    marginLeft: Spacing.sm,
  },

  hint: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  primaryBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },
  btnDisabled: { opacity: 0.45 },
});
