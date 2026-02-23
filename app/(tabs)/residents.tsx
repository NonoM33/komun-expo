import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, SkeletonResident, EmptyState } from '../../src/components';
import { useResidentsStore } from '../../src/stores/residentsStore';
import { Resident } from '../../src/types';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function ResidentsScreen() {
  const {
    filteredResidents,
    isLoading,
    searchQuery,
    fetchResidents,
    search,
    clearSearch,
  } = useResidentsStore();

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchResidents();
  }, []);

  const renderItem = ({ item }: { item: Resident }) => (
    <View style={styles.residentItem}>
      <Avatar
        uri={item.avatar_url}
        name={`${item.first_name} ${item.last_name}`}
        size="lg"
      />

      <View style={styles.residentInfo}>
        <Text style={styles.residentName}>
          {item.first_name} {item.last_name}
        </Text>
        <View style={styles.residentDetails}>
          {item.floor && (
            <View style={styles.detailTag}>
              <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>Étage {item.floor}</Text>
            </View>
          )}
          {(item.apartment || item.apartment_number) && (
            <View style={styles.detailTag}>
              <Ionicons name="home-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>Apt {item.apartment || item.apartment_number}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (isLoading && filteredResidents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un résident..."
              placeholderTextColor={colors.textMuted}
              editable={false}
            />
          </View>
        </View>
        <View style={styles.skeletonContainer}>
          <SkeletonResident count={8} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un résident..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={search}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredResidents}
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
          searchQuery ? (
            <EmptyState
              icon="search-outline"
              title="Aucun résultat"
              message={`Aucun résident trouvé pour "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              icon="people-outline"
              title="Aucun résident"
              message="L'annuaire des résidents apparaîtra ici"
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  skeletonContainer: {
    padding: spacing.md,
  },
  residentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  residentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  residentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
