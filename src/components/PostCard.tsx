import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { colors, borderRadius, spacing } from '../utils/theme';
import api from '../services/api';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onBlockUser?: (userId: string) => void;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Harcèlement' },
  { id: 'inappropriate', label: 'Contenu inapproprié' },
  { id: 'misinformation', label: 'Désinformation' },
  { id: 'other', label: 'Autre' },
];

export function PostCard({ post, onPress, onLike, onComment, onBlockUser }: PostCardProps) {
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleLongPress = () => {
    setShowActionsModal(true);
  };

  const handleReport = () => {
    setShowActionsModal(false);
    setSelectedReason(null);
    setShowReportModal(true);
  };

  const handleBlockUser = () => {
    setShowActionsModal(false);
    Alert.alert(
      'Bloquer cet utilisateur',
      `Êtes-vous sûr de vouloir bloquer ${post.author.first_name} ${post.author.last_name} ? Vous ne verrez plus ses publications.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: () => onBlockUser?.(post.author.id),
        },
      ]
    );
  };

  const submitReport = async () => {
    if (!selectedReason) return;

    setIsReporting(true);
    try {
      await api.createReport({
        reason: selectedReason,
        reportable_type: 'Post',
        reportable_id: post.id,
      });
      setShowReportModal(false);
      Alert.alert('Signalement envoyé', 'Merci pour votre signalement. Notre équipe va examiner ce contenu.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
    } finally {
      setIsReporting(false);
    }
  };

  const authorName = `${post.author.first_name} ${post.author.last_name}`;

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
        delayLongPress={500}
      >
        <View style={styles.header}>
          <Avatar
            uri={post.author.avatar_url}
            name={authorName}
            size="md"
          />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.date}>{formatDate(post.created_at)}</Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleLongPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.content}>{post.content}</Text>

        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.image} />
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onLike}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(post.liked ?? post.liked_by_me) ? 'heart' : 'heart-outline'}
              size={22}
              color={(post.liked ?? post.liked_by_me) ? colors.like : colors.textSecondary}
            />
            <Text
              style={[
                styles.actionText,
                (post.liked ?? post.liked_by_me) && styles.actionTextActive,
              ]}
            >
              {post.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onComment}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.actionText}>{post.comments_count}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

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
              <Text style={styles.actionModalText}>Signaler la publication</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem} onPress={handleBlockUser}>
              <Ionicons name="ban-outline" size={22} color={colors.error} />
              <Text style={[styles.actionModalText, { color: colors.error }]}>
                Bloquer {post.author.first_name}
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
            <Text style={styles.reportTitle}>Signaler cette publication</Text>
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
                onPress={() => setShowReportModal(false)}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  moreButton: {
    padding: spacing.xs,
  },
  content: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceLight,
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionTextActive: {
    color: colors.like,
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
