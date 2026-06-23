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
import { api, adminApi } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import type { AdminUser } from '../../src/types';
import { Colors, Typography, Spacing } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { SeloPayLogo } from '../../src/components/branding';
import type { User } from '../../src/types';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { adminSignIn } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'E-mail obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Senha obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    const credentials = { email: email.trim().toLowerCase(), password };
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', credentials);
      await signIn(data.token, data.user);
      router.replace('/(tabs)/home');
      return;
    } catch {
      // User not found — try admin login
    }
    try {
      const { data } = await adminApi.post<{ token: string; admin: AdminUser }>('/admin/auth/login', credentials);
      await adminSignIn(data.token, data.admin);
      router.replace('/(admin)/disputes');
    } catch {
      Alert.alert('Falha no login', 'E-mail ou senha inválidos.');
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
          {/* Cabeçalho azul */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <SeloPayLogo variant="mark" theme="dark" size="sm" />
          </View>

          {/* Área do formulário */}
          <View style={styles.body}>
            <Text style={styles.title}>Bem-vindo ao SeloPay</Text>
            <Text style={styles.subtitle}>Entre com sua conta SeloPay</Text>

            <Card elevated style={styles.formCard}>
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
                placeholder="Sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={errors.password}
              />
              <Button
                title="Entrar"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleLogin}
                style={styles.submitBtn}
              />
            </Card>

            {/* Link cadastro */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Cadastre-se</Text>
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
