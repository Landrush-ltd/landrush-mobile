import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';

type ScreenState = 'form' | 'loading' | 'success' | 'failure';

const HERO_BG = '#003828';

const STEPS = [
  { icon: 'person-outline' as const,     label: 'Full Name' },
  { icon: 'card-outline' as const,       label: 'NIN' },
  { icon: 'document-outline' as const,   label: 'Document' },
];

export default function VerificationScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ returnTo?: string }>();

  const [screenState, setScreenState] = useState<ScreenState>('form');
  const [fullName, setFullName]       = useState('');
  const [nin, setNin]                 = useState('');
  const [documentName, setDocName]    = useState('');

  const canSubmit = fullName.trim().length > 0 && nin.trim().length === 11;

  const handleVerify = () => {
    if (!canSubmit) return;
    setScreenState('loading');
    setTimeout(() => {
      setScreenState(Math.random() > 0.2 ? 'success' : 'failure');
    }, 2500);
  };

  const handleContinue = () => {
    const returnTo = params.returnTo ?? '/(tabs)';
    router.replace(returnTo as any);
  };

  // ── Loading ───────────────────────────────────────────────────
  if (screenState === 'loading') {
    return (
      <View style={s.fullCenter}>
        <View style={s.loadingCard}>
          <ActivityIndicator size="large" color={Colors.lime} />
          <Text style={s.loadingTitle}>Verifying identity…</Text>
          <Text style={s.loadingSub}>This usually takes a few seconds</Text>
        </View>
      </View>
    );
  }

  // ── Success ───────────────────────────────────────────────────
  if (screenState === 'success') {
    return (
      <View style={[s.fullCenter, { paddingTop: insets.top }]}>
        <View style={s.resultIconWrap}>
          <View style={[s.resultCircle, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </View>
          <View style={s.resultDecoDot} />
        </View>
        <Text style={s.resultTitle}>Identity Verified!</Text>
        <Text style={s.resultSub}>
          Your Landrush account is now verified. You can publish listings, receive inspection
          requests, and access agent features.
        </Text>
        <View style={s.resultBadgeRow}>
          <View style={s.resultBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
            <Text style={s.resultBadgeText}>Verified Member</Text>
          </View>
        </View>
        <TouchableOpacity style={s.primaryBtn} onPress={handleContinue}>
          <Text style={s.primaryBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Failure ───────────────────────────────────────────────────
  if (screenState === 'failure') {
    return (
      <View style={[s.fullCenter, { paddingTop: insets.top }]}>
        <View style={[s.resultCircle, { backgroundColor: '#FFEBEE', marginBottom: Spacing.xl }]}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        </View>
        <Text style={s.resultTitle}>Verification Failed</Text>
        <Text style={s.resultSub}>
          We couldn't verify the details provided. Please check your NIN and try again, or contact
          support if the issue persists.
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setScreenState('form')}>
          <Text style={s.primaryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => router.push('/help')}>
          <Text style={s.ghostBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Dark header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={s.headerDecoA} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.headerTitle}>Identity Verification</Text>
            <Text style={s.headerSub}>Unlock full agent features</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Step chips */}
        <View style={s.stepRow}>
          {STEPS.map((st, i) => (
            <View key={st.label} style={s.stepChip}>
              <Ionicons name={st.icon} size={13} color={Colors.lime} />
              <Text style={s.stepChipText}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={s.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={s.infoText}>
            Your details are encrypted and used only to verify your identity. We never sell your
            data.
          </Text>
        </View>

        {/* Full Name */}
        <Text style={s.label}>Legal Full Name <Text style={s.required}>*</Text></Text>
        <View style={s.inputWrap}>
          <Ionicons name="person-outline" size={17} color={Colors.textTertiary} style={s.inputIcon} />
          <TextInput
            style={s.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="As it appears on your ID"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        {/* NIN */}
        <Text style={s.label}>National Identification Number (NIN) <Text style={s.required}>*</Text></Text>
        <View style={s.inputWrap}>
          <Ionicons name="card-outline" size={17} color={Colors.textTertiary} style={s.inputIcon} />
          <TextInput
            style={s.input}
            value={nin}
            onChangeText={setNin}
            placeholder="11-digit NIN"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            maxLength={11}
          />
          {nin.length > 0 && (
            <Text style={[s.ninCount, nin.length === 11 && s.ninCountDone]}>
              {nin.length}/11
            </Text>
          )}
        </View>

        {/* Document upload */}
        <Text style={s.label}>Redan Certificate <Text style={s.optional}>(Optional)</Text></Text>
        <TouchableOpacity
          style={[s.uploadZone, documentName ? s.uploadZoneFilled : undefined]}
          onPress={() => setDocName(documentName ? '' : 'ReDAAN_Certificate.pdf')}
          activeOpacity={0.8}
        >
          {documentName ? (
            <>
              <View style={s.uploadedIconWrap}>
                <Ionicons name="document-text" size={24} color={Colors.primary} />
              </View>
              <View style={s.uploadedInfo}>
                <Text style={s.uploadedName} numberOfLines={1}>{documentName}</Text>
                <Text style={s.uploadedSize}>245 KB · PDF</Text>
              </View>
              <TouchableOpacity onPress={() => setDocName('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={s.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={28} color={Colors.textTertiary} />
              </View>
              <Text style={s.uploadLabel}>Tap to upload document</Text>
              <Text style={s.uploadHint}>PDF, JPG or PNG · Max 50 MB</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleVerify}
          disabled={!canSubmit}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textPrimary} />
          <Text style={s.submitBtnText}>Submit for Verification</Text>
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          Verification is usually completed within 24–48 hours. You'll receive a notification when done.
        </Text>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    backgroundColor: HERO_BG,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  headerDecoA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(159,187,68,0.07)',
    top: -60,
    right: -40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(159,187,68,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  stepChipText: {
    fontSize: FontSize.xs,
    color: Colors.lime,
    fontWeight: '600',
  },

  // ── Scroll form ───────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.info,
    lineHeight: 20,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: Spacing.lg,
  },
  required: {
    color: Colors.error,
  },
  optional: {
    color: Colors.textTertiary,
    fontWeight: '400',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  ninCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  ninCountDone: {
    color: Colors.success,
  },
  uploadZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    marginTop: 4,
  },
  uploadZoneFilled: {
    borderStyle: 'solid',
    borderColor: Colors.lime,
    backgroundColor: `${Colors.lime}08`,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  uploadHint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  uploadedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedInfo: {
    flex: 1,
  },
  uploadedName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  uploadedSize: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 54,
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.xxl,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  disclaimer: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.lg,
  },

  // ── Full-screen states ────────────────────────────────────────
  fullCenter: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  loadingCard: {
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    width: '100%',
  },
  loadingTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  loadingSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resultIconWrap: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  resultCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDecoDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.lime,
    top: -4,
    right: -4,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  resultTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  resultSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.lime}22`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  resultBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    height: 54,
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ghostBtn: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
