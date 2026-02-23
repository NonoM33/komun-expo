import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, SkeletonPost } from '../../src/components';
import { usePostsStore } from '../../src/stores/postsStore';
import { Comment } from '../../src/types';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const {
    currentPost,
    comments,
    isLoading,
    isLoadingComments,
    fetchPost,
    fetchComments,
    addComment,
    toggleLike,
    clearCurrentPost,
  } = usePostsStore();

  useEffect(() => {
    if (id) {
      fetchPost(id);
      fetchComments(id);
    }

    return () => {
      clearCurrentPost();
    };
  }, [id]);

  const handleRefresh = useCallback(() => {
    if (id) {
      fetchPost(id);
      fetchComments(id);
    }
  }, [id]);

  const handleSendComment = async () => {
    if (!commentText.trim() || !id) return;

    setIsSending(true);
    try {
      await addComment(id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading || !currentPost) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerTitle: 'Publication' }} />
        <View style={styles.loadingContainer}>
          <SkeletonPost count={1} />
        </View>
      </View>
    );
  }

  const authorName = `${currentPost.author.first_name} ${currentPost.author.last_name}`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ headerTitle: 'Publication' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.postCard}>
          <View style={styles.header}>
            <Avatar uri={currentPost.author.avatar_url} name={authorName} size="md" />
            <View style={styles.headerText}>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.date}>{formatDate(currentPost.created_at)}</Text>
            </View>
          </View>

          <Text style={styles.postContent}>{currentPost.content}</Text>

          {currentPost.image_url && (
            <Image source={{ uri: currentPost.image_url }} style={styles.postImage} />
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleLike(currentPost.id)}
            >
              <Ionicons
                name={currentPost.liked_by_me ? 'heart' : 'heart-outline'}
                size={24}
                color={currentPost.liked_by_me ? colors.like : colors.textSecondary}
              />
              <Text
                style={[
                  styles.actionText,
                  currentPost.liked_by_me && styles.actionTextActive,
                ]}
              >
                {currentPost.likes_count} J'aime
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.actionText}>
                {currentPost.comments_count} commentaire{currentPost.comments_count !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Commentaires</Text>

          {isLoadingComments ? (
            <ActivityIndicator color={colors.primary} style={styles.commentsLoader} />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>
              Aucun commentaire. Soyez le premier à commenter !
            </Text>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} formatDate={formatCommentDate} />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Écrire un commentaire..."
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendComment}
          disabled={!commentText.trim() || isSending}
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

function CommentItem({
  comment,
  formatDate,
}: {
  comment: Comment;
  formatDate: (date: string) => string;
}) {
  const authorName = `${comment.author.first_name} ${comment.author.last_name}`;

  return (
    <View style={styles.commentItem}>
      <Avatar uri={comment.author.avatar_url} name={authorName} size="sm" />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{authorName}</Text>
          <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    padding: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  postCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
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
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceLight,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xl,
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
  commentsSection: {
    marginTop: spacing.md,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  commentsLoader: {
    marginVertical: spacing.lg,
  },
  noComments: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  commentContent: {
    flex: 1,
    marginLeft: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  commentInput: {
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
