import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { getInitials } from '../../src/utils/formatters';


export default function ProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser().catch(() => {});
    setRefreshing(false);
  }, [refreshUser]);

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
    );
  }

  if (!user) return null;

  const initials = getInitials(user.name);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Score */}
          <View style={styles.scoreWrap}>
            <Ionicons name="star" size={20} color={Colors.accent} />
            <Text style={styles.scoreValue}>{user.score}</Text>
            <Text style={styles.scoreLabel}>pontos de reputação</Text>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da conta</Text>
          <Card padding="none">
            <InfoRow icon="key-outline" label="Chave SeloPay" value={user.seloKey} mono copyable />
            <InfoRow icon="card-outline" label="CPF" value={user.cpfMasked} />
            <InfoRow icon="mail-outline" label="E-mail" value={user.email} last />
          </Card>
        </View>

        {/* Botão sair */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
  last = false,
  copyable = false,
}: {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
  copyable?: boolean;
}) {
  async function handleCopy() {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copiado', 'Chave SeloPay copiada para a área de transferência.');
  }

  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon as any} size={18} color={Colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, mono && styles.infoValueMono]}>{value}</Text>
      </View>
      {copyable && (
        <TouchableOpacity
          onPress={handleCopy}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.copyBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="copy-outline" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  avatarText: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  userName: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: Spacing.lg,
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  scoreValue: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  scoreLabel: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: Typography.fontWeightMedium,
  },

  section: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoContent: { flex: 1 },
  copyBtn: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    fontWeight: Typography.fontWeightMedium,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.fontSizeMd,
    color: Colors.text,
    fontWeight: Typography.fontWeightMedium,
  },
  infoValueMono: {
    fontFamily: 'monospace',
    color: Colors.primary,
    fontWeight: Typography.fontWeightBold,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutText: {
    fontSize: Typography.fontSizeMd,
    color: Colors.error,
    fontWeight: Typography.fontWeightSemiBold,
  },

});
