import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Card } from '../../src/components';
import { useAuthStore } from '../../src/stores/authStore';
import api from '../../src/services/api';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function RegisterScreen() {
  const [step, setStep] = useState<'invitation' | 'details'>('invitation');
  const [invitationCode, setInvitationCode] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isLoading, error, clearError } = useAuthStore();

  const verifyInvitation = async () => {
    if (!invitationCode.trim()) {
      setErrors({ invitation: "Code d'invitation requis" });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      const result = await api.verifyInvitation(invitationCode.trim());
      if (result.valid) {
        setOrganizationName(result.organization_name);
        setBuildingName(result.building_name);
        setStep('details');
      } else {
        setErrors({ invitation: "Code d'invitation invalide" });
      }
    } catch (err: any) {
      setErrors({
        invitation: err.response?.data?.error || "Code d'invitation invalide",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        invitation_code: invitationCode.trim(),
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    }
  };

  const handleScanQR = () => {
    router.push('/(auth)/scanner');
  };

  if (step === 'invitation') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.logo}>Komun</Text>
              <Text style={styles.subtitle}>
                Entrez votre code d'invitation pour rejoindre votre résidence
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Code d'invitation"
                placeholder="Ex: ABC123"
                value={invitationCode}
                onChangeText={setInvitationCode}
                autoCapitalize="characters"
                autoCorrect={false}
                leftIcon="ticket-outline"
                error={errors.invitation}
              />

              <Text style={styles.orText}>ou</Text>

              <Button
                title="Scanner un QR code"
                onPress={handleScanQR}
                variant="outline"
                icon={<Ionicons name="qr-code-outline" size={20} color={colors.primary} />}
                style={styles.scanButton}
              />

              <Button
                title="Vérifier le code"
                onPress={verifyInvitation}
                loading={isVerifying}
                style={styles.verifyButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte ?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('invitation')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Card style={styles.invitationCard}>
            <View style={styles.invitationHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.invitationTitle}>Code validé</Text>
            </View>
            <Text style={styles.invitationOrg}>{organizationName}</Text>
            <Text style={styles.invitationBuilding}>{buildingName}</Text>
          </Card>

          <View style={styles.form}>
            <View style={styles.row}>
              <Input
                label="Prénom"
                placeholder="Jean"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                containerStyle={styles.halfInput}
                error={errors.firstName}
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                containerStyle={styles.halfInput}
                error={errors.lastName}
              />
            </View>

            <Input
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Mot de passe"
              placeholder="Minimum 8 caractères"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Créer mon compte"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  form: {
    marginBottom: spacing.xl,
  },
  orText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
    fontSize: 14,
  },
  scanButton: {
    marginBottom: spacing.md,
  },
  verifyButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: spacing.md,
  },
  invitationCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  invitationTitle: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  invitationOrg: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  invitationBuilding: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  registerButton: {
    marginTop: spacing.md,
  },
});
