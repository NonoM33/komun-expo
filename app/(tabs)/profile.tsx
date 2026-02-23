import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Input, Card } from '../../src/components';
import { useAuthStore } from '../../src/stores/authStore';
import api from '../../src/services/api';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser, isLoading: isLoggingOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await api.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        bio: bio || undefined,
        avatar: newAvatar || undefined,
      });
      updateUser(updatedUser);
      setIsEditing(false);
      setNewAvatar(null);
      Alert.alert('Succès', 'Votre profil a été mis à jour');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
    setNewAvatar(null);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;
  const displayAvatar = newAvatar || user.avatar_url;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={isEditing ? handlePickImage : undefined}
            disabled={!isEditing}
          >
            <Avatar uri={displayAvatar} name={fullName} size="xl" />
            {isEditing && (
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={16} color={colors.text} />
              </View>
            )}
          </TouchableOpacity>

          {!isEditing && (
            <>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.email}>{user.email}</Text>
              {(user.floor || user.apartment || user.apartment_number) && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.location}>
                    {[user.floor && `Étage ${user.floor}`, (user.apartment || user.apartment_number) && `Apt ${user.apartment || user.apartment_number}`]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.row}>
              <Input
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                containerStyle={styles.halfInput}
              />
              <Input
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
                containerStyle={styles.halfInput}
              />
            </View>

            <Input
              label="Téléphone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="06 12 34 56 78"
              leftIcon="call-outline"
            />

            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Présentez-vous en quelques mots..."
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />

            <View style={styles.editButtons}>
              <Button
                title="Annuler"
                onPress={handleCancel}
                variant="secondary"
                style={styles.cancelButton}
              />
              <Button
                title="Enregistrer"
                onPress={handleSave}
                loading={isSaving}
                style={styles.saveButton}
              />
            </View>
          </View>
        ) : (
          <>
            {user.bio && (
              <Card style={styles.bioCard}>
                <Text style={styles.bioLabel}>À propos</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </Card>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setIsEditing(true)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="create-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Modifier mon profil</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
                <View style={[styles.actionIcon, styles.logoutIcon]}>
                  <Ionicons name="log-out-outline" size={22} color={colors.error} />
                </View>
                <Text style={[styles.actionText, styles.logoutText]}>Déconnexion</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bioCard: {
    marginBottom: spacing.lg,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  bioText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  actions: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logoutIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  logoutText: {
    color: colors.error,
  },
  editForm: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
