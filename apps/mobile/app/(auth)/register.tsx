import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import type { User } from '../../src/types';

function applyMaskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export default function RegisterScreen() {
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) e.name = 'Nome completo obrigatório (mín. 3 caracteres)';
    if (cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF deve ter 11 dígitos';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido';
    if (!password || password.length < 6) e.password = 'Senha com mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', {
        name: name.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        password,
      });
      await signIn(data.token, data.user);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Erro no cadastro', err.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.brand}>
              <View style={styles.logoMini}>
                <Text style={styles.logoMiniText}>S</Text>
              </View>
              <Text style={styles.brandName}>SeloPay</Text>
            </View>
          </View>

          {/* Formulário */}
          <View style={styles.body}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

            <Card elevated style={styles.formCard}>
              <Input
                label="Nome completo"
                placeholder="Seu nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                leftIcon="person-outline"
                error={errors.name}
              />
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={(t) => setCpf(applyMaskCPF(t))}
                keyboardType="numeric"
                leftIcon="card-outline"
                error={errors.cpf}
              />
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail-outline"
                error={errors.email}
              />
              <Input
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={errors.password}
              />

              <Button
                title="Criar conta"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleRegister}
                style={styles.submitBtn}
              />
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoMini: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMiniText: {
    fontSize: 15,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  brandName: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },

  body: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },

  formCard: { marginBottom: Spacing.lg },
  submitBtn: { marginTop: Spacing.sm },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: Typography.fontSizeMd, color: Colors.textSecondary },
  footerLink: {
    fontSize: Typography.fontSizeMd,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },
});
