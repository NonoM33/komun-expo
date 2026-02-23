import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, Avatar } from '../../src/components';
import { usePostsStore } from '../../src/stores/postsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const { createPost, isCreating } = usePostsStore();
  const { user } = useAuthStore();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose');
      return;
    }

    try {
      await createPost(content.trim(), image || undefined);
      router.back();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la publication');
    }
  };

  const canSubmit = content.trim().length > 0;
  const authorName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerTitle: 'Nouvelle publication',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelButton}>Annuler</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || isCreating}
            >
              <Text
                style={[
                  styles.submitButton,
                  (!canSubmit || isCreating) && styles.submitButtonDisabled,
                ]}
              >
                {isCreating ? 'Publication...' : 'Publier'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Avatar uri={user?.avatar_url} name={authorName} size="md" />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.visibility}>Visible par tous les résidents</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Quoi de neuf dans la résidence ?"
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          maxLength={2000}
        />

        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
              <Ionicons name="close-circle" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.characterCount}>
          <Text style={styles.characterCountText}>{content.length} / 2000</Text>
        </View>
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={24} color={colors.primary} />
          <Text style={styles.toolbarButtonText}>Photo</Text>
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
  cancelButton: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  submitButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  visibility: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  input: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imagePreview: {
    position: 'relative',
    marginTop: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
  },
  characterCount: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  toolbar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
  },
  toolbarButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
