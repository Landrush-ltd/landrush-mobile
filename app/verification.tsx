import React, { useState, useEffect, useRef } from 'react';
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
import { lookupNIN, NINLookupError } from '../src/services/ninVerification';
import type { NINRecord } from '../src/services/ninVerification';

type SubmitState = 'idle' | 'submitting' | 'success' | 'failure';


export default function VerificationScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ returnTo?: string }>();

  const [nin, setNin]               = useState('');
  const [ninLoading, setNinLoading] = useState(false);
  const [ninError, setNinError]     = useState('');
  const [ninRecord, setNinRecord]   = useState<NINRecord | null>(null);

  const [documentName, setDocName]  = useState('');
  const [submitState, setSubmit]    = useState<SubmitState>('idle');

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(16)).current;
  const lookupRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-lookup when NIN reaches 11 digits
  useEffect(() => {
    if (nin.length < 11) {
      setNinRecord(null);
      setNinError('');
      fadeAnim.setValue(0);
      slideAnim.setValue(16);
      return;
    }

    if (lookupRef.current) clearTimeout(lookupRef.current);
    lookupRef.current = setTimeout(async () => {
      setNinLoading(true);
      setNinError('');
      setNinRecord(null);
      try {
        const record = await lookupNIN(nin);
        setNinRecord(record);
        // Animate name card in
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]).start();
      } catch (err) {
        setNinError(err instanceof NINLookupError ? err.message : 'Lookup failed. Try again.');
      } finally {
        setNinLoading(false);
      }
    }, 300);

    return () => { if (lookupRef.current) clearTimeout(lookupRef.current); };
  }, [nin]);

  const canSubmit = ninRecord !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmit('submitting');
    setTimeout(() => {
      setSubmit(Math.random() > 0.2 ? 'success' : 'failure');
    }, 2500);
  };

  const handleContinue = () => {
    router.replace((params.returnTo ?? '/(tabs)') as any);
  };

  // ── Submitting ────────────────────────────────────────────────
  if (submitState === 'submitting') {
    return (
      <View style={s.fullCenter}>
        <View style={s.loadingCard}>
          <ActivityIndicator size="large" color={Colors.lime} />
          <Text style={s.loadingTitle}>Submitting for review…</Text>
          <Text style={s.loadingSub}>Cross-checking with NIMC database</Text>
        </View>
      </View>
    );
  }

  // ── Success ───────────────────────────────────────────────────
  if (submitState === 'success') {
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
        <View style={s.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={s.verifiedBadgeText}>Verified Member</Text>
        </View>
        <TouchableOpacity style={s.primaryBtn} onPress={handleContinue}>
          <Text style={s.primaryBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Failure ───────────────────────────────────────────────────
  if (submitState === 'failure') {
    return (
      <View style={[s.fullCenter, { paddingTop: insets.top }]}>
        <View style={[s.resultCircle, { backgroundColor: '#FFEBEE', marginBottom: Spacing.xl }]}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        </View>
        <Text style={s.resultTitle}>Verification Failed</Text>
        <Text style={s.resultSub}>
          We couldn't complete your verification. Please check your details and try again, or
          contact support if the issue persists.
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setSubmit('idle')}>
          <Text style={s.primaryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => router.push('/help')}>
          <Text style={s.ghostBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  // Display order: First Middle Last (Given names before surname)
  const fullName = ninRecord
    ? [ninRecord.firstName, ninRecord.middleName, ninRecord.lastName]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <View style={s.root}>
      {/* Dark header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={s.headerDecoA} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.headerTitle}>Identity Verification</Text>
            <Text style={s.headerSub}>Unlock full agent features</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={s.infoBanner}>
          <Ionicons name="lock-closed-outline" size={16} color={Colors.info} />
          <Text style={s.infoText}>
            Your NIN is encrypted in transit and used only to verify your identity. We never
            store or share it.
          </Text>
        </View>

        {/* NIN input */}
        <Text style={s.label}>
          National Identification Number (NIN){' '}
          <Text style={s.required}>*</Text>
        </Text>
        <View style={[s.inputWrap, ninError ? s.inputWrapError : ninRecord ? s.inputWrapSuccess : undefined]}>
          <Ionicons
            name="card-outline"
            size={17}
            color={ninError ? Colors.error : ninRecord ? Colors.success : Colors.textTertiary}
            style={s.inputIcon}
          />
          <TextInput
            style={s.input}
            value={nin}
            onChangeText={(t) => setNin(t.replace(/\D/g, '').slice(0, 11))}
            placeholder="Enter your 11-digit NIN"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            maxLength={11}
          />
          {ninLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : nin.length > 0 ? (
            <Text style={[s.ninCount, ninRecord ? s.ninCountOk : nin.length === 11 && ninError ? s.ninCountErr : undefined]}>
              {nin.length}/11
            </Text>
          ) : null}
        </View>

        {/* NIN error */}
        {ninError ? (
          <View style={s.ninErrorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
            <Text style={s.ninErrorText}>{ninError}</Text>
          </View>
        ) : null}

        {/* Lookup loading hint */}
        {ninLoading && (
          <Text style={s.lookingUpText}>Looking up NIN in NIMC database…</Text>
        )}

        {/* Verified name card — animates in after lookup */}
        {ninRecord && (
          <Animated.View
            style={[s.nameCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={s.nameCardHeader}>
              <View style={s.nameCardBadge}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
                <Text style={s.nameCardBadgeText}>Verified from NIMC</Text>
              </View>
            </View>

            <Text style={s.nameCardName}>{fullName}</Text>

            {/* ── DEBUG: raw API fields ── remove before shipping ── */}
            {ninRecord._raw && Object.keys(ninRecord._raw).length > 0 && (
              <View style={s.debugBox}>
                <Text style={s.debugTitle}>RAW API FIELDS (debug)</Text>
                {Object.entries(ninRecord._raw).map(([k, v]) => (
                  <Text key={k} style={s.debugRow}>
                    <Text style={s.debugKey}>{k}:</Text> {v}
                  </Text>
                ))}
              </View>
            )}

            <View style={s.nameCardDetails}>
              {ninRecord.gender ? (
                <View style={s.nameCardChip}>
                  <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
                  <Text style={s.nameCardChipText}>{ninRecord.gender}</Text>
                </View>
              ) : null}
              {ninRecord.dob ? (
                <View style={s.nameCardChip}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                  <Text style={s.nameCardChipText}>{ninRecord.dob}</Text>
                </View>
              ) : null}
              {ninRecord.phone ? (
                <View style={s.nameCardChip}>
                  <Ionicons name="call-outline" size={12} color={Colors.textSecondary} />
                  <Text style={s.nameCardChipText}>{ninRecord.phone}</Text>
                </View>
              ) : null}
            </View>

            <Text style={s.nameCardNote}>
              This name will be shown on your verified Landrush profile and cannot be changed.
            </Text>
          </Animated.View>
        )}

        {/* Document upload */}
        <Text style={s.label}>
          Redan Certificate{' '}
          <Text style={s.optional}>(Optional)</Text>
        </Text>
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
                <Ionicons name="cloud-upload-outline" size={26} color={Colors.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.uploadLabel}>Upload Redan Certificate</Text>
                <Text style={s.uploadHint}>PDF, JPG or PNG · Max 50 MB</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </>
          )}
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={canSubmit ? 0.85 : 1}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textPrimary} />
          <Text style={s.submitBtnText}>Submit for Verification</Text>
        </TouchableOpacity>

        {!canSubmit && nin.length < 11 && (
          <Text style={s.disclaimer}>Enter your 11-digit NIN to continue</Text>
        )}
        {canSubmit && (
          <Text style={s.disclaimer}>
            Review is typically completed within 24–48 hours. You'll be notified.
          </Text>
        )}

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
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerDecoA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'transparent',
    top: -60,
    right: -40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
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
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // ── Scroll ────────────────────────────────────────────────────
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
    marginBottom: 8,
    marginTop: Spacing.lg,
  },
  required: { color: Colors.error },
  optional: { color: Colors.textTertiary, fontWeight: '400' },

  // NIN input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 54,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputWrapError:   { borderColor: Colors.error },
  inputWrapSuccess: { borderColor: Colors.success },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  ninCount: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  ninCountOk:  { color: Colors.success },
  ninCountErr: { color: Colors.error },

  ninErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
  },
  ninErrorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    flex: 1,
    lineHeight: 18,
  },
  lookingUpText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // ── Verified name card ────────────────────────────────────────
  nameCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.lime,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  nameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.lime}22`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  nameCardBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  nameCardName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  nameCardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  nameCardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  nameCardChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nameCardNote: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  debugBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: 3,
  },
  debugTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7fdbca',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  debugRow: { fontSize: 11, color: '#e0e0e0', lineHeight: 17 },
  debugKey: { fontWeight: '700', color: '#9FBB44' },

  // ── Document upload ───────────────────────────────────────────
  uploadZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: 4,
  },
  uploadZoneFilled: {
    borderStyle: 'solid',
    borderColor: Colors.lime,
    backgroundColor: `${Colors.lime}08`,
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  uploadedInfo: { flex: 1 },
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

  // ── Submit ────────────────────────────────────────────────────
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
  submitBtnDisabled: { opacity: 0.4 },
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
  resultIconWrap: { position: 'relative', marginBottom: Spacing.sm },
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.lime}22`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  verifiedBadgeText: {
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
