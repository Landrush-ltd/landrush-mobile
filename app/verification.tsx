import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';

type ScreenState = 'form' | 'loading' | 'success' | 'failure';

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ returnTo?: string }>();

  const [screenState, setScreenState] = useState<ScreenState>('form');
  const [fullName, setFullName] = useState('');
  const [nin, setNin] = useState('');
  const [documentName, setDocumentName] = useState('');

  const handleVerify = () => {
    if (!fullName || !nin) return;
    setScreenState('loading');
    setTimeout(() => {
      // Simulate API response — 80% success
      setScreenState(Math.random() > 0.2 ? 'success' : 'failure');
    }, 2500);
  };

  const handleContinue = () => {
    const returnTo = params.returnTo ?? '/(tabs)/create';
    router.replace(returnTo as any);
  };

  if (screenState === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.lime} />
        <Text style={styles.loadingText}>Verifying...</Text>
      </View>
    );
  }

  if (screenState === 'success') {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={52} color={Colors.white} />
        </View>
        <Text style={styles.resultTitle}>Verification Complete</Text>
        <Text style={styles.resultSubtitle}>
          Your identity has been successfully verified. You can now publish listings and receive
          inspection requests on Landrush.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue Listing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screenState === 'failure') {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.failureCircle}>
          <Ionicons name="globe-outline" size={52} color={Colors.textSecondary} />
        </View>
        <Text style={styles.resultTitle}>We Couldn't Verify Your Information</Text>
        <Text style={styles.resultSubtitle}>
          We were unable to verify the details provided. Please review your information and try
          again.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setScreenState('form')}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>
        Provide your information to complete your agent profile.
      </Text>

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter Full Name"
        placeholderTextColor={Colors.textTertiary}
        autoCapitalize="words"
      />

      {/* NIN */}
      <Text style={styles.label}>NIN</Text>
      <TextInput
        style={styles.input}
        value={nin}
        onChangeText={setNin}
        placeholder="Enter NIN"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="numeric"
        maxLength={11}
      />

      {/* Document upload */}
      <TouchableOpacity
        style={styles.uploadZone}
        onPress={() => setDocumentName('ReDAAN_Certificate.pdf')}
        activeOpacity={0.8}
      >
        <View style={styles.uploadIcon}>
          <Ionicons name="cloud-upload-outline" size={32} color={Colors.textTertiary} />
        </View>
        {documentName ? (
          <View style={styles.uploadedRow}>
            <Ionicons name="document-outline" size={18} color={Colors.primary} />
            <Text style={styles.uploadedName} numberOfLines={1}>{documentName}</Text>
            <TouchableOpacity onPress={() => setDocumentName('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.uploadLabel}>Upload Redan Certificate (Optional)</Text>
            <Text style={styles.uploadHint}>PDF, JPG, PNG · Max 50mb</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.verifyButton, (!fullName || !nin) && styles.verifyButtonDisabled]}
        onPress={handleVerify}
        disabled={!fullName || !nin}
      >
        <Text style={styles.verifyButtonText}>Verify</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    height: 52,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadZone: {
    marginTop: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    marginBottom: Spacing.xxxl,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  uploadLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  uploadHint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  uploadedName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: Colors.lime,
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.xl,
  },
  loadingText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  failureCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.huge,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
