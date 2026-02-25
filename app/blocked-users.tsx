import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, EmptyState } from '../src/components';
import { useBlockedUsersStore } from '../src/stores/blockedUsersStore';
import { Block } from '../src/types';
import { colors, spacing, borderRadius } from '../src/utils/theme';

export default function BlockedUsersScreen() {
  const { blockedUsers, isLoading, fetchBlockedUsers, unblockUser } = useBlockedUsersStore();

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = (block: Block) => {
    const userName = `${block.blocked_user.first_name} ${block.blocked_user.last_name}`;
    Alert.alert(
      'Débloquer cet utilisateur',
      `Êtes-vous sûr de vouloir débloquer ${userName} ? Vous verrez à nouveau ses publications et messages.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Débloquer',
          onPress: async () => {
            try {
              await unblockUser(block.id);
              Alert.alert('Utilisateur débloqué', `${userName} a été débloqué.`);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de débloquer cet utilisateur.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Block }) => {
    const userName = `${item.blocked_user.first_name} ${item.blocked_user.last_name}`;

    return (
      <View style={styles.userItem}>
        <Avatar
          uri={item.blocked_user.avatar_url}
          name={userName}
          size="md"
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.blockedDate}>
            Bloqué le {new Date(item.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.unblockButton}
          onPress={() => handleUnblock(item)}
        >
          <Text style={styles.unblockText}>Débloquer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Utilisateurs bloqués',
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={blockedUsers.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="checkmark-circle-outline"
              title="Aucun utilisateur bloqué"
              message="Vous n'avez bloqué aucun utilisateur pour le moment."
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
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
  list: {
    padding: spacing.md,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  blockedDate: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  unblockText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  separator: {
    height: spacing.sm,
  },
});
