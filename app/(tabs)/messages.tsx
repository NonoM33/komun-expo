import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, SkeletonChannel, EmptyState } from '../../src/components';
import { useChannelsStore } from '../../src/stores/channelsStore';
import { Channel } from '../../src/types';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function MessagesScreen() {
  const { channels, isLoading, fetchChannels } = useChannelsStore();

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchChannels();
  }, []);

  const handleChannelPress = (channelId: string) => {
    router.push(`/channel/${channelId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Maintenant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderItem = ({ item }: { item: Channel }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() => handleChannelPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.channelIcon}>
        <Ionicons name="chatbubbles" size={24} color={colors.primary} />
      </View>

      <View style={styles.channelContent}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelName} numberOfLines={1}>
            {item.name}
          </Text>
          {(item.last_message_at || (typeof item.last_message === 'object' && item.last_message?.created_at)) && (
            <Text style={styles.channelTime}>
              {formatDate(item.last_message_at || (typeof item.last_message === 'object' ? item.last_message?.created_at : undefined))}
            </Text>
          )}
        </View>

        <View style={styles.channelPreview}>
          {item.last_message ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {typeof item.last_message === 'string'
                ? item.last_message
                : (
                  <>
                    <Text style={styles.lastMessageAuthor}>
                      {item.last_message.author.first_name}:{' '}
                    </Text>
                    {item.last_message.content}
                  </>
                )
              }
            </Text>
          ) : (
            <Text style={styles.noMessages}>Aucun message</Text>
          )}
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unread_count > 99 ? '99+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  if (isLoading && channels.length === 0) {
    return (
      <View style={styles.container}>
        <SkeletonChannel count={6} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Aucun canal"
            message="Les canaux de discussion de votre résidence apparaîtront ici"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flexGrow: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  channelTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  channelPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  lastMessageAuthor: {
    fontWeight: '500',
  },
  noMessages: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: spacing.sm,
  },
  unreadCount: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 76,
  },
});
