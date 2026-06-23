import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { SeloPayLogo } from '../../src/components/branding';

const { height } = Dimensions.get('window');

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={Colors.accent} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <SeloPayLogo variant="full" theme="dark" size="lg" />
        </View>

        <Text style={styles.tagline}>
          Formalize acordos.{'\n'}Garanta pagamentos.{'\n'}Com segurança.
        </Text>

        <Text style={styles.subtitle}>
          Crie acordos digitais, acompanhe compromissos e proteja pagamentos entre as partes.
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureItem icon="document-text-outline" text="Acordos formalizados com garantia digital" />
        <FeatureItem icon="lock-closed-outline" text="Valor protegido até a conclusão" />
        <FeatureItem icon="scale-outline" text="Contestação e mediação integrada" />
      </View>

      <View style={styles.actions}>
        <Button
          title="Entrar na conta"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
          style={styles.btnEntrar}
        />
        <Button
          title="Criar conta grátis"
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/register')}
          style={styles.btnCriar}
          textStyle={{ color: Colors.white }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: height > 700 ? Spacing.xxxxl : Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  tagline: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.fontSizeMd,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  featureText: {
    fontSize: Typography.fontSizeMd,
    color: Colors.white,
    fontWeight: Typography.fontWeightMedium,
    flex: 1,
  },
  actions: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: height > 700 ? Spacing.xxxl : Spacing.xxl,
    gap: Spacing.md,
  },
  btnEntrar: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnCriar: {
    borderColor: 'rgba(255,255,255,0.45)',
  },
});
