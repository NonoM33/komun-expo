import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { Avatar } from './Avatar';
import { colors, borderRadius, spacing } from '../utils/theme';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}

export function PostCard({ post, onPress, onLike, onComment }: PostCardProps) {
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

  const authorName = `${post.author.first_name} ${post.author.last_name}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
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
            name={post.liked_by_me ? 'heart' : 'heart-outline'}
            size={22}
            color={post.liked_by_me ? colors.like : colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              post.liked_by_me && styles.actionTextActive,
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
});
