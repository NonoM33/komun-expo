import { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard, SkeletonPost, EmptyState } from '../../src/components';
import { usePostsStore } from '../../src/stores/postsStore';
import { useBlockedUsersStore } from '../../src/stores/blockedUsersStore';
import { colors, spacing } from '../../src/utils/theme';

export default function HomeScreen() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    fetchPosts,
    fetchMorePosts,
    toggleLike,
  } = usePostsStore();

  const { blockedUserIds, fetchBlockedUsers, blockUser } = useBlockedUsersStore();

  useEffect(() => {
    fetchPosts();
    fetchBlockedUsers();
  }, []);

  // Filter out posts from blocked users
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => !blockedUserIds.has(post.author.id));
  }, [posts, blockedUserIds]);

  const handleRefresh = useCallback(() => {
    fetchPosts(true);
    fetchBlockedUsers();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore) {
      fetchMorePosts();
    }
  }, [isLoadingMore]);

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleCreatePost = () => {
    router.push('/post/create');
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await blockUser(userId);
      Alert.alert('Utilisateur bloqué', 'Vous ne verrez plus les publications de cet utilisateur.');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de bloquer cet utilisateur.');
    }
  };

  const renderItem = ({ item }: { item: typeof posts[0] }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item.id)}
      onLike={() => toggleLike(item.id)}
      onComment={() => handlePostPress(item.id)}
      onBlockUser={handleBlockUser}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          <SkeletonPost count={4} />
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
          <Ionicons name="add" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPosts}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="Aucune publication"
            message="Soyez le premier à partager quelque chose avec vos voisins !"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
        <Ionicons name="add" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  skeletonContainer: {
    padding: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
