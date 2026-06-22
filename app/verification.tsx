import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Animated, Dimensions, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';
import { lookupNIN, verifyNINWithFace, NINLookupError } from '../src/services/ninVerification';
import type { NINRecord } from '../src/services/ninVerification';

const { width, height } = Dimensions.get('window');

const OVAL_W    = Math.min(width * 0.7, 280);
const OVAL_H    = OVAL_W * 1.35;
const OVAL_LEFT = (width - OVAL_W) / 2;
const OVAL_TOP  = height * 0.14;

type Step = 'nin' | 'face' | 'preview' | 'success' | 'failure';

// ── Face scan camera ──────────────────────────────────────────────
function FaceScan({
  onCapture,
  onCancel,
}: {
  onCapture: (base64: string, uri: string) => void;
  onCancel: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const ringAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!permission) {
    return <View style={cam.center}><ActivityIndicator color={Colors.lime} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={cam.center}>
        <Ionicons name="camera-outline" size={56} color={Colors.white} />
        <Text style={cam.permTitle}>Camera Access Required</Text>
        <Text style={cam.permSub}>
          We need your camera to verify your face against your NIN record.
        </Text>
        <TouchableOpacity style={cam.permBtn} onPress={requestPermission}>
          <Text style={cam.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={cam.permCancel}>
          <Text style={cam.permCancelText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (photo?.base64) onCapture(photo.base64, photo.uri);
      else setCapturing(false);
    } catch {
      setCapturing(false);
    }
  };

  return (
    <View style={cam.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />

      {/* Dark mask panels surrounding oval */}
      <View style={[cam.mask, { top: 0, left: 0, right: 0, height: OVAL_TOP }]} />
      <View style={[cam.mask, { top: OVAL_TOP, left: 0, width: OVAL_LEFT, height: OVAL_H }]} />
      <View style={[cam.mask, { top: OVAL_TOP, right: 0, width: OVAL_LEFT, height: OVAL_H }]} />
      <View style={[cam.mask, { top: OVAL_TOP + OVAL_H, left: 0, right: 0, bottom: 0 }]} />

      {/* Pulsing lime oval border */}
      <Animated.View
        style={[
          cam.oval,
          {
            top: OVAL_TOP, left: OVAL_LEFT,
            width: OVAL_W, height: OVAL_H,
            borderRadius: OVAL_W / 2,
            transform: [{ scale: ringAnim }],
          },
        ]}
      />

      <TouchableOpacity style={cam.closeBtn} onPress={onCancel}>
        <Ionicons name="close" size={22} color={Colors.white} />
      </TouchableOpacity>

      <View style={[cam.instruction, { top: OVAL_TOP - 76 }]}>
        <Text style={cam.instructionText}>Position your face in the oval</Text>
        <Text style={cam.instructionSub}>Look directly at the camera and stay still</Text>
      </View>

      <View style={cam.captureWrap}>
        <TouchableOpacity
          style={[cam.captureBtn, capturing && { opacity: 0.6 }]}
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.8}
        >
          {capturing
            ? <ActivityIndicator color={Colors.primary} size="large" />
            : <View style={cam.captureInner} />}
        </TouchableOpacity>
        <Text style={cam.captureHint}>Tap to capture</Text>
      </View>
    </View>
  );
}

// ── Photo preview ─────────────────────────────────────────────────
function PhotoPreview({
  uri,
  onRetake,
  onConfirm,
  loading,
}: {
  uri: string;
  onRetake: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <View style={prev.root}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={prev.dim} />
      <View
        style={[
          prev.ovalFrame,
          {
            position: 'absolute',
            top: OVAL_TOP, left: OVAL_LEFT,
            width: OVAL_W, height: OVAL_H,
            borderRadius: OVAL_W / 2,
          },
        ]}
      />
      <TouchableOpacity style={prev.closeBtn} onPress={onRetake}>
        <Ionicons name="close" size={22} color={Colors.white} />
      </TouchableOpacity>
      <View style={prev.actions}>
        <Text style={prev.title}>Does this look good?</Text>
        <Text style={prev.sub}>Make sure your face is clear and well-lit</Text>
        <TouchableOpacity style={prev.confirmBtn} onPress={onConfirm} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.textPrimary} />
            : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textPrimary} />
                <Text style={prev.confirmText}>Yes, Submit</Text>
              </>
            )}
        </TouchableOpacity>
        <TouchableOpacity style={prev.retakeBtn} onPress={onRetake} disabled={loading}>
          <Ionicons name="camera-outline" size={18} color={Colors.white} />
          <Text style={prev.retakeText}>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────
export default function VerificationScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ returnTo?: string }>();

  const [step, setStep]             = useState<Step>('nin');
  const [nin, setNin]               = useState('');
  const [ninLoading, setNinLoading] = useState(false);
  const [ninError, setNinError]     = useState('');
  const [ninRecord, setNinRecord]   = useState<NINRecord | null>(null);

  const [photoUri,    setPhotoUri]    = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [faceLoading, setFaceLoading] = useState(false);

  const [documentName, setDocName] = useState('');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const lookupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (nin.length < 11) {
      setNinRecord(null); setNinError('');
      fadeAnim.setValue(0); slideAnim.setValue(16);
      return;
    }
    if (lookupRef.current) clearTimeout(lookupRef.current);
    lookupRef.current = setTimeout(async () => {
      setNinLoading(true); setNinError(''); setNinRecord(null);
      try {
        const record = await lookupNIN(nin);
        setNinRecord(record);
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

  const handleCaptured = (base64: string, uri: string) => {
    setPhotoBase64(base64); setPhotoUri(uri); setStep('preview');
  };

  const handleFaceConfirm = async () => {
    setFaceLoading(true);
    try {
      await verifyNINWithFace(nin, photoBase64);
      setStep('success');
    } catch {
      setStep('failure');
    }
  };

  const resetFace = () => {
    setPhotoUri(''); setPhotoBase64(''); setFaceLoading(false); setStep('face');
  };

  const fullName = ninRecord
    ? [ninRecord.firstName, ninRecord.middleName, ninRecord.lastName].filter(Boolean).join(' ')
    : '';

  if (step === 'face') {
    return <FaceScan onCapture={handleCaptured} onCancel={() => setStep('nin')} />;
  }

  if (step === 'preview') {
    return (
      <PhotoPreview
        uri={photoUri}
        onRetake={resetFace}
        onConfirm={handleFaceConfirm}
        loading={faceLoading}
      />
    );
  }

  if (step === 'success') {
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
          Your Landrush account is fully verified. You can publish listings, receive inspection
          requests, and access all agent features.
        </Text>
        <View style={s.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={s.verifiedBadgeText}>Verified Member</Text>
        </View>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.replace((params.returnTo ?? '/(tabs)') as any)}
        >
          <Text style={s.primaryBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'failure') {
    return (
      <View style={[s.fullCenter, { paddingTop: insets.top }]}>
        <View style={[s.resultCircle, { backgroundColor: '#FFEBEE', marginBottom: Spacing.xl }]}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        </View>
        <Text style={s.resultTitle}>Verification Failed</Text>
        <Text style={s.resultSub}>
          We couldn't match your face with your NIN record. Make sure your face is clearly visible
          and try again in good lighting.
        </Text>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => { setStep('nin'); setPhotoUri(''); setPhotoBase64(''); }}
        >
          <Text style={s.primaryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => router.push('/help')}>
          <Text style={s.ghostBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Step 1: NIN ───────────────────────────────────────────────
  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
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

        <View style={s.stepsRow}>
          <View style={s.stepActive}>
            <Text style={s.stepNumActive}>1</Text>
          </View>
          <View style={s.stepLine} />
          <View style={ninRecord ? s.stepReady : s.stepInactive}>
            <Ionicons
              name="scan-outline" size={14}
              color={ninRecord ? Colors.primary : Colors.textTertiary}
            />
          </View>
        </View>
        <View style={s.stepsLabelRow}>
          <Text style={s.stepLabelActive}>NIN</Text>
          <Text style={[s.stepLabel, ninRecord && { color: Colors.primary }]}>Face Scan</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.infoBanner}>
          <Ionicons name="lock-closed-outline" size={16} color={Colors.info} />
          <Text style={s.infoText}>
            Your NIN and face scan are encrypted and used only to verify your identity via NIMC.
          </Text>
        </View>

        <Text style={s.label}>
          National Identification Number (NIN){' '}
          <Text style={s.required}>*</Text>
        </Text>
        <View style={[s.inputWrap, ninError ? s.inputWrapError : ninRecord ? s.inputWrapSuccess : undefined]}>
          <Ionicons
            name="card-outline" size={17}
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
          {ninLoading
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : nin.length > 0
              ? <Text style={[s.ninCount, ninRecord ? s.ninCountOk : nin.length === 11 && ninError ? s.ninCountErr : undefined]}>
                  {nin.length}/11
                </Text>
              : null}
        </View>

        {ninError ? (
          <View style={s.ninErrorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
            <Text style={s.ninErrorText}>{ninError}</Text>
          </View>
        ) : null}
        {ninLoading && <Text style={s.lookingUpText}>Looking up NIN in NIMC database…</Text>}

        {ninRecord && (
          <Animated.View style={[s.nameCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={s.nameCardHeader}>
              <View style={s.nameCardBadge}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
                <Text style={s.nameCardBadgeText}>Found in NIMC</Text>
              </View>
            </View>
            {!ninRecord._raw && (
              <View style={s.mockBanner}>
                <Ionicons name="flask-outline" size={13} color="#b45309" />
                <Text style={s.mockText}>TEST MODE — not your real NIMC data</Text>
              </View>
            )}
            <Text style={s.nameCardName}>{fullName}</Text>
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

        <TouchableOpacity
          style={[s.submitBtn, !ninRecord && s.submitBtnDisabled]}
          onPress={() => setStep('face')}
          disabled={!ninRecord}
          activeOpacity={ninRecord ? 0.85 : 1}
        >
          <Ionicons name="scan-outline" size={18} color={Colors.textPrimary} />
          <Text style={s.submitBtnText}>Continue to Face Scan</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>

        {!ninRecord && nin.length < 11 && (
          <Text style={s.disclaimer}>Enter your 11-digit NIN to continue</Text>
        )}
        {ninRecord && (
          <Text style={s.disclaimer}>
            Next: a quick selfie to confirm your identity matches your NIN record.
          </Text>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ── Camera styles ─────────────────────────────────────────────────
const cam = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxl, gap: Spacing.lg,
  },
  mask: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.62)' },
  oval: {
    position: 'absolute',
    borderWidth: 2.5, borderColor: Colors.lime, backgroundColor: 'transparent',
  },
  closeBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  instruction: {
    position: 'absolute', left: 0, right: 0,
    alignItems: 'center', paddingHorizontal: Spacing.xxl, gap: 4,
  },
  instructionText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  instructionSub:  { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.72)', textAlign: 'center' },
  captureWrap: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center', gap: 10,
  },
  captureBtn: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.white, borderWidth: 4, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
  captureInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.lime },
  captureHint:  { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  permTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  permSub:   { fontSize: FontSize.md, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22 },
  permBtn: {
    backgroundColor: Colors.lime,
    paddingHorizontal: Spacing.xxl, paddingVertical: 14,
    borderRadius: BorderRadius.full, marginTop: Spacing.sm,
  },
  permBtnText:    { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  permCancel:     { paddingVertical: Spacing.md },
  permCancelText: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.6)' },
});

// ── Preview styles ────────────────────────────────────────────────
const prev = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#000' },
  dim:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  ovalFrame: { borderWidth: 2.5, borderColor: Colors.lime, backgroundColor: 'transparent' },
  closeBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: 48,
    gap: Spacing.md, alignItems: 'center',
  },
  title:       { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  sub:         { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, width: '100%', height: 52,
    backgroundColor: Colors.lime, borderRadius: BorderRadius.xl, marginTop: Spacing.sm,
  },
  confirmText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, width: '100%', height: 48,
    borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  retakeText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
});

// ── Main screen styles ────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.md, marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  headerSub:   { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1, textAlign: 'center' },

  stepsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  stepActive: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepReady: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${Colors.lime}22`, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  stepInactive: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.background, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumActive: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.white },
  stepLine:      { height: 2, width: 60, backgroundColor: Colors.borderLight, marginHorizontal: 4 },
  stepsLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4, marginBottom: 4,
  },
  stepLabelActive: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  stepLabel:       { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textTertiary },

  scroll:     { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  infoBanner: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: '#E3F2FD', borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.info, lineHeight: 20 },
  label: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: 8, marginTop: Spacing.lg,
  },
  required: { color: Colors.error },
  optional:  { color: Colors.textTertiary, fontWeight: '400' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    height: 54, backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputWrapError:   { borderColor: Colors.error },
  inputWrapSuccess: { borderColor: Colors.success },
  inputIcon:   { flexShrink: 0 },
  input: {
    flex: 1, fontSize: FontSize.lg, fontWeight: '600',
    color: Colors.textPrimary, letterSpacing: 2,
  },
  ninCount:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textTertiary },
  ninCountOk:  { color: Colors.success },
  ninCountErr: { color: Colors.error },
  ninErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.sm },
  ninErrorText: { fontSize: FontSize.sm, color: Colors.error, flex: 1, lineHeight: 18 },
  lookingUpText: { fontSize: FontSize.sm, color: Colors.primary, marginTop: Spacing.sm, fontStyle: 'italic' },

  nameCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, marginTop: Spacing.lg,
    borderWidth: 1.5, borderColor: Colors.lime, gap: Spacing.md, ...Shadow.sm,
  },
  nameCardHeader:    { flexDirection: 'row', alignItems: 'center' },
  nameCardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.lime}22`,
    paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  nameCardBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  nameCardName:      { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  nameCardDetails:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  nameCardChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.full,
  },
  nameCardChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  nameCardNote: {
    fontSize: FontSize.xs, color: Colors.textTertiary, lineHeight: 18,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md,
  },
  mockBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fef3c7', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  mockText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
  debugBox: {
    backgroundColor: '#1a1a2e', borderRadius: 8, padding: Spacing.md, marginTop: Spacing.sm, gap: 3,
  },
  debugTitle: {
    fontSize: 9, fontWeight: '700', color: '#7fdbca',
    letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase',
  },
  debugRow: { fontSize: 11, color: '#e0e0e0', lineHeight: 17 },
  debugKey:  { fontWeight: '700', color: '#9FBB44' },

  uploadZone: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
    backgroundColor: Colors.white, marginTop: 4,
  },
  uploadZoneFilled: { borderStyle: 'solid', borderColor: Colors.lime, backgroundColor: `${Colors.lime}08` },
  uploadIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  uploadLabel:      { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  uploadHint:       { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  uploadedIconWrap: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.lime}18`, alignItems: 'center', justifyContent: 'center',
  },
  uploadedInfo: { flex: 1 },
  uploadedName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.primary },
  uploadedSize: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, height: 54, backgroundColor: Colors.lime,
    borderRadius: BorderRadius.xl, marginTop: Spacing.xxl,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  disclaimer: {
    fontSize: FontSize.sm, color: Colors.textTertiary,
    textAlign: 'center', lineHeight: 20, marginTop: Spacing.lg,
  },

  fullCenter: {
    flex: 1, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxl, gap: Spacing.lg,
  },
  resultIconWrap: { position: 'relative', marginBottom: Spacing.sm },
  resultCircle:   { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  resultDecoDot: {
    position: 'absolute', width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.lime, top: -4, right: -4,
    borderWidth: 3, borderColor: Colors.white,
  },
  resultTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  resultSub:   { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${Colors.lime}22`,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  verifiedBadgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, width: '100%', height: 54,
    backgroundColor: Colors.lime, borderRadius: BorderRadius.xl, marginTop: Spacing.sm,
  },
  primaryBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  ghostBtn: {
    width: '100%', height: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border,
  },
  ghostBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
});
