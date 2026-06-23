import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { formatCurrency } from '../../src/utils/formatters';
import type { User } from '../../src/types';

const TOTAL_STEPS = 4;

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function parseAmount(text: string): number {
  return parseFloat(text.trim().replace(',', '.'));
}

function autoFormatDate(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length > 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

function parseDateBR(text: string): Date | null {
  const parts = text.trim().split('/');
  if (parts.length !== 3 || parts[2].length < 4) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2024) return null;
  const date = new Date(y, m - 1, d);
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) return null;
  return date;
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

export default function CreateGuaranteedAgreement() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const todayStart = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxDate = addDays(todayStart, 30);

  // Step 1
  const [seloKeyInput, setSeloKeyInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);

  // Step 2
  const [amountText, setAmountText] = useState('');
  const [amountError, setAmountError] = useState('');

  // Step 3
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [manualDateText, setManualDateText] = useState('');
  const [dateError, setDateError] = useState('');
  const [showManual, setShowManual] = useState(false);

  // Step 4
  const [submitting, setSubmitting] = useState(false);

  function handleBack() {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  }

  async function handleSearch() {
    const raw = seloKeyInput.trim();
    if (!raw) { setSearchError('Informe a Chave SeloPay.'); return; }
    const key = raw.startsWith('@') ? raw : `@${raw}`;
    setSearching(true);
    setSearchError('');
    setFoundUser(null);
    try {
      const { data } = await api.get<User>(`/users/by-key/${key}`);
      if (data.id === user?.id) {
        setSearchError('Você não pode criar um acordo consigo mesmo.');
        return;
      }
      setFoundUser(data);
    } catch (err: any) {
      setSearchError(err.message ?? 'Usuário não encontrado. Verifique a chave.');
    } finally {
      setSearching(false);
    }
  }

  function handleAmountNext() {
    const val = parseAmount(amountText);
    if (isNaN(val) || val < 1) {
      setAmountError('Informe um valor válido (mínimo R$ 1,00).');
      return;
    }
    setAmountError('');
    setStep(3);
  }

  function selectPreset(days: number) {
    setSelectedDate(addDays(todayStart, days));
    setManualDateText('');
    setDateError('');
    setShowManual(false);
  }

  function handleManualDateChange(text: string) {
    const formatted = autoFormatDate(text);
    setManualDateText(formatted);
    setDateError('');
    if (formatted.length === 10) {
      const parsed = parseDateBR(formatted);
      if (!parsed) { setDateError('Data inválida. Use DD/MM/AAAA.'); setSelectedDate(null); return; }
      const d = new Date(parsed); d.setHours(0, 0, 0, 0);
      if (d < todayStart) { setDateError('A data não pode ser no passado.'); setSelectedDate(null); return; }
      if (d > maxDate) { setDateError('O prazo máximo é de 30 dias.'); setSelectedDate(null); return; }
      setSelectedDate(parsed);
    } else {
      setSelectedDate(null);
    }
  }

  function handleDateNext() {
    if (!selectedDate) { setDateError('Escolha ou informe uma data.'); return; }
    setDateError('');
    setStep(4);
  }

  async function handleSubmit() {
    if (!foundUser || !selectedDate) return;
    const amount = parseAmount(amountText);
    if (isNaN(amount)) return;

    const dueDate = new Date(selectedDate);
    dueDate.setHours(23, 59, 0, 0);
    const raw = seloKeyInput.trim();
    const receiverSeloKey = raw.startsWith('@') ? raw : `@${raw}`;

    setSubmitting(true);
    try {
      await api.post('/agreements', {
        type: 'GUARANTEED',
        receiverSeloKey,
        amount,
        dueDate: dueDate.toISOString(),
      });
      Alert.alert(
        'Acordo enviado!',
        `Acordo enviado. Após o aceite de ${foundUser.name.split(' ')[0]}, o depósito será solicitado.`,
        [{ text: 'Ver Acordos', onPress: () => router.replace('/(tabs)/agreements') }],
      );
    } catch (err: any) {
      Alert.alert('Erro ao criar acordo', err.message ?? 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  const parsedAmount = parseAmount(amountText);
  const amountDisplay = !isNaN(parsedAmount) && parsedAmount >= 1 ? formatCurrency(parsedAmount) : null;

  const PRESETS = [
    { label: 'Hoje', days: 0 },
    { label: 'Amanhã', days: 1 },
    { label: 'Em 7 dias', days: 7 },
    { label: 'Em 30 dias', days: 30 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Novo Acordo</Text>
          {step > 0 && (
            <Text style={styles.headerSubtitle}>Etapa {step} de {TOTAL_STEPS}</Text>
          )}
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.white} />
        </View>
      </View>

      {/* Progress */}
      {step > 0 && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step 0: Explicação ── */}
          {step === 0 && (
            <View style={styles.stepWrap}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="shield-checkmark-outline" size={28} color={Colors.accent} />
                </View>
                <Text style={styles.infoTitle}>Como funciona?</Text>
                <Text style={styles.infoBody}>
                  Este acordo protege as duas partes. O valor combinado será depositado e guardado
                  pela SeloPay até que o cumprimento do acordo seja confirmado.
                </Text>
              </View>

              <View style={styles.featureList}>
                {[
                  { icon: 'lock-closed-outline', text: 'Valor guardado pela SeloPay' },
                  { icon: 'shield-checkmark-outline', text: 'Liberação apenas com confirmação mútua' },
                  { icon: 'ribbon-outline', text: 'Maior impacto no Score SeloPay' },
                ].map((item, i) => (
                  <View key={i} style={styles.featureRow}>
                    <View style={styles.featureIconWrap}>
                      <Ionicons name={item.icon as any} size={18} color={Colors.accent} />
                    </View>
                    <Text style={styles.featureText}>{item.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.highlightBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.accent} />
                <Text style={styles.highlightText}>
                  O depósito será solicitado após o recebedor aceitar o acordo.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setStep(1)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Entendido, continuar</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 1: Buscar pessoa ── */}
          {step === 1 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepBadge}>Etapa 1 de 4</Text>
              <Text style={styles.stepTitle}>Quem vai receber?</Text>
              <Text style={styles.stepDesc}>Informe a Chave SeloPay da outra parte.</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Chave SeloPay</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={seloKeyInput}
                    onChangeText={(t) => { setSeloKeyInput(t); setSearchError(''); setFoundUser(null); }}
                    placeholder="@carlos456"
                    placeholderTextColor={Colors.textLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                  />
                  <TouchableOpacity
                    style={[styles.searchBtn, searching && styles.btnDisabled]}
                    onPress={handleSearch}
                    disabled={searching}
                    activeOpacity={0.8}
                  >
                    {searching
                      ? <ActivityIndicator size="small" color={Colors.white} />
                      : <Ionicons name="search" size={20} color={Colors.white} />}
                  </TouchableOpacity>
                </View>
                {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}
              </View>

              {foundUser && (
                <View style={styles.foundCard}>
                  <View style={styles.foundAvatar}>
                    <Text style={styles.foundInitials}>{getInitials(foundUser.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foundName}>{foundUser.name}</Text>
                    <Text style={styles.foundKey}>{foundUser.seloKey}</Text>
                    {foundUser.cpfMasked && (
                      <Text style={styles.foundCpf}>CPF: {foundUser.cpfMasked}</Text>
                    )}
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                </View>
              )}

              {foundUser && (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setStep(2)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Confirmar pessoa</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Step 2: Valor ── */}
          {step === 2 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepBadge}>Etapa 2 de 4</Text>
              <Text style={styles.stepTitle}>Qual o valor garantido?</Text>
              <Text style={styles.stepDesc}>
                Este valor será depositado e guardado pela SeloPay.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Valor a garantir</Text>
                <View style={styles.amountWrap}>
                  <Text style={styles.currencySign}>R$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amountText}
                    onChangeText={(t) => { setAmountText(t); setAmountError(''); }}
                    placeholder="0,00"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
                {amountDisplay && (
                  <Text style={styles.amountPreview}>{amountDisplay}</Text>
                )}
                {!!amountError && <Text style={styles.errorText}>{amountError}</Text>}
              </View>

              <View style={styles.highlightBox}>
                <Ionicons name="lock-closed-outline" size={14} color={Colors.accent} />
                <Text style={styles.highlightText}>
                  Este valor será debitado da sua carteira após o aceite do acordo.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !amountText.trim() && styles.btnDisabled]}
                onPress={handleAmountNext}
                activeOpacity={0.85}
                disabled={!amountText.trim()}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 3: Data ── */}
          {step === 3 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepBadge}>Etapa 3 de 4</Text>
              <Text style={styles.stepTitle}>Qual a data limite?</Text>
              <Text style={styles.stepDesc}>Prazo para cumprimento e liberação do valor.</Text>

              <View style={styles.presetsGrid}>
                {PRESETS.map((opt) => {
                  const d = addDays(todayStart, opt.days);
                  const isActive = !showManual && selectedDate &&
                    formatDateBR(selectedDate) === formatDateBR(d);
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[styles.presetChip, isActive && styles.presetChipActive]}
                      onPress={() => selectPreset(opt.days)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.presetDate, isActive && styles.presetDateActive]}>
                        {formatDateBR(d)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.manualToggle, showManual && styles.manualToggleActive]}
                onPress={() => {
                  setShowManual((v) => !v);
                  setSelectedDate(null);
                  setManualDateText('');
                  setDateError('');
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showManual ? 'calendar' : 'calendar-outline'}
                  size={17}
                  color={showManual ? Colors.white : Colors.accent}
                />
                <Text style={[styles.manualToggleText, showManual && styles.manualToggleTextActive]}>
                  Escolher data manualmente
                </Text>
              </TouchableOpacity>

              {showManual && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Data (DD/MM/AAAA)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={manualDateText}
                    onChangeText={handleManualDateChange}
                    placeholder="15/07/2026"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="done"
                  />
                </View>
              )}

              {selectedDate && !dateError && (
                <View style={styles.dateConfirmed}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.dateConfirmedText}>Prazo: {formatDateBR(selectedDate)}</Text>
                </View>
              )}
              {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, !selectedDate && styles.btnDisabled]}
                onPress={handleDateNext}
                activeOpacity={0.85}
                disabled={!selectedDate}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 4: Resumo ── */}
          {step === 4 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepBadge}>Etapa 4 de 4</Text>
              <Text style={styles.stepTitle}>Confirmar acordo</Text>
              <Text style={styles.stepDesc}>Revise os dados antes de enviar.</Text>

              <View style={styles.summaryCard}>
                <SummaryRow icon="shield-checkmark-outline" label="Tipo" value="Acordo" accent />
                <SummaryRow icon="person-outline" label="Recebedor" value={foundUser?.name ?? ''} />
                <SummaryRow icon="key-outline" label="Chave SeloPay" value={foundUser?.seloKey ?? ''} mono />
                {foundUser?.cpfMasked && (
                  <SummaryRow icon="card-outline" label="CPF" value={foundUser.cpfMasked} />
                )}
                <SummaryRow
                  icon="cash-outline"
                  label="Valor garantido"
                  value={formatCurrency(parseAmount(amountText))}
                  highlight
                />
                <SummaryRow
                  icon="calendar-outline"
                  label="Data limite"
                  value={selectedDate ? formatDateBR(selectedDate) : ''}
                  last
                />
              </View>

              <View style={styles.highlightBox}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.accent} />
                <Text style={styles.highlightText}>
                  O depósito de {formatCurrency(parseAmount(amountText))} será solicitado após{' '}
                  {foundUser?.name.split(' ')[0]} aceitar o acordo.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, submitting && styles.btnDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Enviar Acordo</Text>
                    <Ionicons name="paper-plane-outline" size={18} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon, label, value, mono = false, last = false, highlight = false, accent = false,
}: {
  icon: string; label: string; value: string;
  mono?: boolean; last?: boolean; highlight?: boolean; accent?: boolean;
}) {
  return (
    <View style={[sRow.row, last && sRow.rowLast]}>
      <View style={[sRow.iconWrap, accent && sRow.iconWrapAccent]}>
        <Ionicons name={icon as any} size={16} color={accent ? Colors.accent : Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sRow.label}>{label}</Text>
        <Text style={[sRow.value, mono && sRow.valueMono, highlight && sRow.valueHL, accent && sRow.valueAccent]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const sRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconWrapAccent: { backgroundColor: Colors.accent + '15' },
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
  valueMono: {
    fontFamily: 'monospace',
    color: Colors.primary,
    fontWeight: Typography.fontWeightBold,
  },
  valueHL: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  valueAccent: {
    color: Colors.accent,
    fontWeight: Typography.fontWeightBold,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primaryDark,
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
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTrack: { height: 3, backgroundColor: Colors.borderLight },
  progressFill: { height: 3, backgroundColor: Colors.accent },

  scroll: { padding: Spacing.xxl },
  stepWrap: { gap: Spacing.lg },

  stepBadge: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginTop: -Spacing.sm,
  },
  stepDesc: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  infoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  infoBody: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  featureList: { gap: Spacing.sm },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.accent + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },

  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.accent + '10',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  highlightText: {
    flex: 1,
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontWeight: Typography.fontWeightMedium,
  },

  fieldGroup: { gap: Spacing.xs },
  fieldLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizeMd,
    color: Colors.text,
  },
  searchRow: { flexDirection: 'row', gap: Spacing.sm },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  foundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.success + '40',
    ...Shadows.sm,
  },
  foundAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.success + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundInitials: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.success,
  },
  foundName: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  foundKey: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  foundCpf: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    marginTop: 2,
  },

  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  currencySign: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.lg,
  },
  amountPreview: {
    fontSize: Typography.fontSizeSm,
    color: Colors.accent,
    fontWeight: Typography.fontWeightSemiBold,
  },

  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 3,
    ...Shadows.sm,
  },
  presetChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  presetLabel: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
  },
  presetLabelActive: { color: Colors.white },
  presetDate: { fontSize: Typography.fontSizeXs, color: Colors.textLight },
  presetDateActive: { color: 'rgba(255,255,255,0.7)' },

  manualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  manualToggleActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  manualToggleText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.accent,
  },
  manualToggleTextActive: { color: Colors.white },

  dateConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  dateConfirmedText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.success,
  },

  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },

  errorText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.error,
    fontWeight: Typography.fontWeightMedium,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
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
