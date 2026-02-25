import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button } from '../../src/components';
import { useChannelsStore } from '../../src/stores/channelsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useBlockedUsersStore } from '../../src/stores/blockedUsersStore';
import { Message } from '../../src/types';
import { colors, spacing, borderRadius } from '../../src/utils/theme';
import api from '../../src/services/api';

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Harcèlement' },
  { id: 'inappropriate', label: 'Contenu inapproprié' },
  { id: 'misinformation', label: 'Désinformation' },
  { id: 'other', label: 'Autre' },
];

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Report modal state
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);

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
  const { blockedUserIds, blockUser } = useBlockedUsersStore();

  // Filter out messages from blocked users
  const filteredMessages = useMemo(() => {
    return messages.filter((message) => !blockedUserIds.has(message.author.id));
  }, [messages, blockedUserIds]);

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
    if (filteredMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [filteredMessages.length]);

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

  const handleLongPressMessage = (message: Message) => {
    if (message.author.id === user?.id) return; // Don't show actions for own messages
    setSelectedMessage(message);
    setShowActionsModal(true);
  };

  const handleReport = () => {
    setShowActionsModal(false);
    setSelectedReason(null);
    setShowReportModal(true);
  };

  const handleBlockUser = () => {
    if (!selectedMessage) return;
    setShowActionsModal(false);

    const authorName = `${selectedMessage.author.first_name} ${selectedMessage.author.last_name}`;
    Alert.alert(
      'Bloquer cet utilisateur',
      `Êtes-vous sûr de vouloir bloquer ${authorName} ? Vous ne verrez plus ses messages.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(selectedMessage.author.id);
              Alert.alert('Utilisateur bloqué', 'Vous ne verrez plus les messages de cet utilisateur.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de bloquer cet utilisateur.');
            }
          },
        },
      ]
    );
  };

  const submitReport = async () => {
    if (!selectedReason || !selectedMessage) return;

    setIsReporting(true);
    try {
      await api.createReport({
        reason: selectedReason,
        reportable_type: 'Message',
        reportable_id: selectedMessage.id,
      });
      setShowReportModal(false);
      setSelectedMessage(null);
      Alert.alert('Signalement envoyé', 'Merci pour votre signalement. Notre équipe va examiner ce contenu.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
    } finally {
      setIsReporting(false);
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

    const currentDate = new Date(filteredMessages[index].created_at).toDateString();
    const previousDate = new Date(filteredMessages[index - 1].created_at).toDateString();

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
        <TouchableOpacity
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}
          onLongPress={() => handleLongPressMessage(item)}
          delayLongPress={500}
          activeOpacity={0.8}
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
        </TouchableOpacity>
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
          data={filteredMessages}
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

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={styles.actionsModalContent}>
            <TouchableOpacity style={styles.actionModalItem} onPress={handleReport}>
              <Ionicons name="flag-outline" size={22} color={colors.warning} />
              <Text style={styles.actionModalText}>Signaler le message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem} onPress={handleBlockUser}>
              <Ionicons name="ban-outline" size={22} color={colors.error} />
              <Text style={[styles.actionModalText, { color: colors.error }]}>
                Bloquer {selectedMessage?.author.first_name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionModalItem, styles.cancelItem]}
              onPress={() => setShowActionsModal(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalContent}>
            <Text style={styles.reportTitle}>Signaler ce message</Text>
            <Text style={styles.reportSubtitle}>Pourquoi signalez-vous ce contenu ?</Text>

            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonItem,
                  selectedReason === reason.id && styles.reasonItemSelected,
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason.id && styles.reasonTextSelected,
                  ]}
                >
                  {reason.label}
                </Text>
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.reportButtons}>
              <Button
                title="Annuler"
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedMessage(null);
                }}
                variant="secondary"
                style={styles.reportButton}
              />
              <Button
                title="Signaler"
                onPress={submitReport}
                variant="primary"
                style={styles.reportButton}
                disabled={!selectedReason}
                loading={isReporting}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  actionsModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  actionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionModalText: {
    fontSize: 16,
    color: colors.text,
  },
  cancelItem: {
    marginTop: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reportModalContent: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  reportSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  reasonItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  reasonText: {
    fontSize: 15,
    color: colors.text,
  },
  reasonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  reportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  reportButton: {
    flex: 1,
  },
});
