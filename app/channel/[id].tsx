import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components';
import { useChannelsStore } from '../../src/stores/channelsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { Message } from '../../src/types';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const {
    currentChannel,
    messages,
    isLoadingMessages,
    isSending,
    fetchChannel,
    fetchMessages,
    sendMessage,
    startPolling,
    stopPolling,
    clearCurrentChannel,
  } = useChannelsStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchChannel(id);
      fetchMessages(id);
      startPolling(id);
    }

    return () => {
      stopPolling();
      clearCurrentChannel();
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !id) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      await sendMessage(id, text);
    } catch (error) {
      setMessageText(text);
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const shouldShowDateHeader = (index: number) => {
    if (index === 0) return true;

    const currentDate = new Date(messages[index].created_at).toDateString();
    const previousDate = new Date(messages[index - 1].created_at).toDateString();

    return currentDate !== previousDate;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.author.id === user?.id;
    const authorName = `${item.author.first_name} ${item.author.last_name}`;
    const showDateHeader = shouldShowDateHeader(index);

    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              {formatDateHeader(item.created_at)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}
        >
          {!isOwnMessage && (
            <Avatar uri={item.author.avatar_url} name={authorName} size="sm" />
          )}
          <View
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessage : styles.otherMessage,
            ]}
          >
            {!isOwnMessage && (
              <Text style={styles.messageAuthor}>{item.author.first_name}</Text>
            )}
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          headerTitle: currentChannel?.name || 'Messages',
        }}
      />

      {isLoadingMessages && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucun message</Text>
              <Text style={styles.emptySubtext}>
                Soyez le premier à envoyer un message !
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          placeholderTextColor={colors.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Ionicons name="send" size={20} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateHeaderText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  ownMessage: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  otherMessage: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.xs,
    marginLeft: spacing.sm,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
