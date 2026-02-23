import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components';
import api from '../../src/services/api';
import { colors, spacing, borderRadius } from '../../src/utils/theme';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isVerifying) return;

    setScanned(true);
    setIsVerifying(true);

    try {
      const result = await api.verifyInvitation(data);
      if (result.valid) {
        Alert.alert(
          'Code valide',
          `Vous rejoignez ${result.building_name} (${result.organization_name})`,
          [
            {
              text: 'Continuer',
              onPress: () => {
                router.back();
                // Pass the code back to register screen
                router.setParams({ invitationCode: data });
              },
            },
          ]
        );
      } else {
        Alert.alert('Code invalide', "Ce QR code n'est pas valide", [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible de vérifier le code", [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          <Text style={styles.permissionTitle}>Accès à la caméra</Text>
          <Text style={styles.permissionText}>
            Autorisez l'accès à la caméra pour scanner le QR code d'invitation
          </Text>
          <Button
            title="Autoriser la caméra"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Placez le QR code dans le cadre
            </Text>
            {isVerifying && (
              <Text style={styles.verifyingText}>Vérification en cours...</Text>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const SCAN_SIZE = 250;
const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scanArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    marginTop: -SCAN_SIZE / 2,
    marginLeft: -SCAN_SIZE / 2,
    backgroundColor: 'transparent',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: colors.primary,
    borderTopLeftRadius: borderRadius.sm,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: colors.primary,
    borderTopRightRadius: borderRadius.sm,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: colors.primary,
    borderBottomLeftRadius: borderRadius.sm,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyingText: {
    color: colors.primary,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
});
