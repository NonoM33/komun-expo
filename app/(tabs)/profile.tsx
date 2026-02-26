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
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteAccount = () => {
    setDeletePassword('');
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Mot de passe requis');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      // Clear auth state and redirect to login
      await logout();
      router.replace('/(auth)/login');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Mot de passe incorrect ou erreur serveur';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
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

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push('/blocked-users')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="ban-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Utilisateurs bloqués</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionItem, styles.lastActionItem]} onPress={handleLogout}>
                <View style={[styles.actionIcon, styles.logoutIcon]}>
                  <Ionicons name="log-out-outline" size={22} color={colors.error} />
                </View>
                <Text style={[styles.actionText, styles.logoutText]}>Déconnexion</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Legal Section */}
            <Text style={styles.sectionTitle}>Légal</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => Linking.openURL('https://api.komun.app/terms')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Conditions Générales d'Utilisation</Text>
                <Ionicons name="open-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, styles.lastActionItem]}
                onPress={() => Linking.openURL('https://api.komun.app/privacy')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Politique de Confidentialité</Text>
                <Ionicons name="open-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <Text style={styles.sectionTitle}>Zone de danger</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionItem, styles.lastActionItem]} onPress={handleDeleteAccount}>
                <View style={[styles.actionIcon, styles.deleteIcon]}>
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                </View>
                <Text style={[styles.actionText, styles.logoutText]}>Supprimer mon compte</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalWarningIcon}>
                <Ionicons name="warning" size={32} color={colors.error} />
              </View>
              <Text style={styles.modalTitle}>Supprimer mon compte</Text>
              <Text style={styles.modalDescription}>
                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              </Text>
            </View>

            <Input
              label="Confirmez avec votre mot de passe"
              placeholder="Mot de passe"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={deleteError || undefined}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Annuler"
                onPress={() => setShowDeleteModal(false)}
                variant="secondary"
                style={styles.modalButton}
                disabled={isDeleting}
              />
              <Button
                title={isDeleting ? 'Suppression...' : 'Supprimer'}
                onPress={confirmDeleteAccount}
                variant="primary"
                style={[styles.modalButton, styles.deleteButton]}
                loading={isDeleting}
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
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
  lastActionItem: {
    borderBottomWidth: 0,
  },
  deleteIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalWarningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});
