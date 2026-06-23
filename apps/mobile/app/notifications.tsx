import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, timeAgo } from '../src/contexts/NotificationsContext';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';

export default function NotificationsScreen() {
  const { notifications, readIds, unreadCount, loading, refreshing, refresh, markRead, markAllRead } =
    useNotifications();

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
          <Text style={styles.headerTitle}>Notificações</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} pendente{unreadCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.markAllText}>Marcar lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="notifications-off-outline" size={40} color={Colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Tudo tranquilo por aqui</Text>
              <Text style={styles.emptyText}>
                Quando houver atualizações nos seus acordos elas aparecerão aqui.
              </Text>
            </View>
          ) : (
            notifications.map((item) => {
              const isRead = readIds.has(item.id) || !item.urgent;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notifCard, !isRead && styles.notifCardUnread]}
                  activeOpacity={0.75}
                  onPress={() => {
                    markRead(item.id);
                    if (item.agreementId) {
                      router.push({ pathname: '/agreements/[id]', params: { id: item.agreementId } });
                    }
                  }}
                >
                  <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  </View>

                  <View style={styles.notifBody}>
                    <View style={styles.notifTopRow}>
                      <View style={styles.notifTitleRow}>
                        {!isRead && <View style={styles.unreadDot} />}
                        <Text style={[styles.notifTitle, !isRead && styles.notifTitleUnread]}>
                          {item.title}
                        </Text>
                      </View>
                      <Text style={styles.notifTime}>{timeAgo(item.date)}</Text>
                    </View>
                    <Text style={styles.notifDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {notifications.length > 0 && (
            <View style={styles.footer}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textLight} />
              <Text style={styles.footerText}>
                Notificações geradas a partir dos seus acordos ativos.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },

  scroll: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },

  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  notifCardUnread: {
    borderColor: Colors.primary + '45',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginRight: 6,
    flexShrink: 0,
    alignSelf: 'center',
  },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifBody: { flex: 1 },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  notifTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.text,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: Typography.fontWeightBold,
  },
  notifTime: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    flexShrink: 0,
  },
  notifDesc: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    textAlign: 'center',
    flex: 1,
  },
});
