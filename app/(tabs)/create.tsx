import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ListingCategory } from '../../src/types/listing';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const HERO_BG = '#003828';
const STEPS = ['Type', 'Details', 'Location', 'Media', 'Price', 'Review'];

const CATEGORY_OPTIONS: { key: ListingCategory; label: string; desc: string; icon: IoniconsName; color: string; bg: string }[] = [
  { key: 'sale',     label: 'For Sale',      desc: 'Outright purchase of land',        icon: 'home-outline',  color: Colors.sale,     bg: `${Colors.sale}18` },
  { key: 'lease',    label: 'For Lease',     desc: 'Temporary use for a fixed period', icon: 'leaf-outline',  color: Colors.lease,    bg: `${Colors.lease}18` },
  { key: 'distress', label: 'Distress Sale', desc: 'Urgent sale at reduced price',     icon: 'flash-outline', color: Colors.distress, bg: `${Colors.distress}18` },
];

const SIZE_UNITS = ['Plot', 'Acres', 'Hectares', 'Sqm'];

const NG_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

export default function CreateListingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const progAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const uploadAnim = useRef(new Animated.Value(0)).current;

  const [step, setStep]         = useState(0);
  const [direction, setDir]     = useState<1 | -1>(1);
  const [category, setCat]      = useState<ListingCategory | null>(null);
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [state, setState]       = useState('');
  const [location, setLoc]      = useState('');
  const [size, setSize]         = useState('');
  const [sizeUnit, setSizeUnit] = useState('Plot');
  const [leaseDur, setLeaseDur] = useState('');
  const [price, setPrice]       = useState('');
  const [priceType, setPriceType] = useState<'total' | 'per_unit'>('total');
  const [photos, setPhotos]     = useState<string[]>([]);
  const [isUploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);
  const [draftSaved, setDraft]  = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate progress bar on step change
  useEffect(() => {
    Animated.timing(progAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [step]);

  // Auto-save draft
  useEffect(() => {
    if (!title && !location && !price) return;
    draftTimer.current = setTimeout(() => {
      setDraft(true);
      setTimeout(() => setDraft(false), 2500);
    }, 10000);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [title, location, price, step]);

  const animateSlide = (dir: 1 | -1, cb: () => void) => {
    slideAnim.setValue(dir * 60);
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 11, useNativeDriver: true }).start();
    cb();
  };

  const goNext = () => {
    if (step === 0 && !category) { Alert.alert('Select a type', 'Please choose a listing type.'); return; }
    if (step < STEPS.length - 1) { setDir(1); animateSlide(1, () => setStep((s) => s + 1)); }
    else {
      Alert.alert('Listing Submitted!', 'Your listing is now under review and will go live shortly.', [
        { text: 'Go to Home', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  };

  const goBack = () => {
    if (step > 0) { setDir(-1); animateSlide(-1, () => setStep((s) => s - 1)); }
  };

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.75,
      selectionLimit: 8,
    });
    if (result.canceled) return;
    setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 8));
    simulateUpload();
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access is required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.75 });
    if (result.canceled) return;
    setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 8));
    simulateUpload();
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadPct(0);
    uploadAnim.setValue(0);
    Animated.timing(uploadAnim, { toValue: 1, duration: 1800, useNativeDriver: false }).start(() => {
      setUploading(false);
      setUploadPct(100);
    });
    uploadAnim.addListener(({ value }) => setUploadPct(Math.round(value * 100)));
  };

  const fmtPrice = (raw: string) => {
    const n = parseInt(raw.replace(/,/g, ''), 10);
    return isNaN(n) ? '' : n.toLocaleString();
  };

  // ── Step renderers ────────────────────────────────────────────

  const StepType = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>What type of listing?</Text>
      <Text style={s.stepSub}>Choose the category that describes your land</Text>
      {CATEGORY_OPTIONS.map((opt) => {
        const active = category === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[s.catCard, active && { borderColor: opt.color, backgroundColor: opt.bg }]}
            onPress={() => setCat(opt.key)}
            activeOpacity={0.85}
          >
            <View style={[s.catIconWrap, { backgroundColor: active ? opt.color : `${opt.color}22` }]}>
              <Ionicons name={opt.icon} size={22} color={active ? Colors.white : opt.color} />
            </View>
            <View style={s.catInfo}>
              <Text style={s.catLabel}>{opt.label}</Text>
              <Text style={s.catDesc}>{opt.desc}</Text>
            </View>
            <View style={[s.radio, active && { borderColor: opt.color }]}>
              {active && <View style={[s.radioDot, { backgroundColor: opt.color }]} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const StepDetails = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>Listing Details</Text>
      <Text style={s.stepSub}>Tell buyers what makes your land special</Text>

      <Text style={s.label}>Title *</Text>
      <TextInput
        style={s.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. 3 Plots of Land, Uyo GRA"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={s.label}>Description</Text>
      <TextInput
        style={[s.input, s.textarea]}
        value={description}
        onChangeText={setDesc}
        placeholder="Describe the land, access road, utilities, nearby landmarks…"
        placeholderTextColor={Colors.textTertiary}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Text style={s.label}>Land Size *</Text>
      <View style={s.sizeRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={size}
          onChangeText={setSize}
          placeholder="Enter size"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.unitRow}>
        {SIZE_UNITS.map((u) => (
          <TouchableOpacity
            key={u}
            style={[s.unitChip, sizeUnit === u && s.unitChipActive]}
            onPress={() => setSizeUnit(u)}
          >
            <Text style={[s.unitText, sizeUnit === u && s.unitTextActive]}>{u}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {category === 'lease' && (
        <>
          <Text style={s.label}>Lease Duration</Text>
          <TextInput
            style={s.input}
            value={leaseDur}
            onChangeText={setLeaseDur}
            placeholder="e.g. 2 years, 5 years"
            placeholderTextColor={Colors.textTertiary}
          />
        </>
      )}
    </View>
  );

  const StepLocation = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>Location</Text>
      <Text style={s.stepSub}>Help buyers find your land</Text>

      <Text style={s.label}>State *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stateRow}>
        {NG_STATES.map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.stateChip, state === st && s.stateChipActive]}
            onPress={() => setState(st)}
          >
            <Text style={[s.stateText, state === st && s.stateTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.label}>Area / Address</Text>
      <TextInput
        style={s.input}
        value={location}
        onChangeText={setLoc}
        placeholder="e.g. Behind High Court, Ikot Ekpene"
        placeholderTextColor={Colors.textTertiary}
      />

      <TouchableOpacity style={s.mapPickBtn}>
        <Ionicons name="location-outline" size={18} color={Colors.primary} />
        <Text style={s.mapPickText}>Pin location on map</Text>
      </TouchableOpacity>
    </View>
  );

  const StepMedia = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>Photos & Documents</Text>
      <Text style={s.stepSub}>High-quality photos get 3× more enquiries</Text>

      {/* Photo grid */}
      {photos.length > 0 && (
        <View style={s.photoGrid}>
          {photos.map((uri, i) => (
            <View key={i} style={s.photoCell}>
              <Image source={{ uri }} style={s.photoImg} />
              {i === 0 && (
                <View style={s.coverBadge}><Text style={s.coverBadgeText}>Cover</Text></View>
              )}
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
              >
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 8 && (
            <TouchableOpacity style={s.addMoreCell} onPress={pickPhotos}>
              <Ionicons name="add" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Upload progress */}
      {isUploading && (
        <View style={s.progressWrap}>
          <View style={s.progressTopRow}>
            <Text style={s.progressLabel}>Uploading photos…</Text>
            <Text style={s.progressPct}>{uploadPct}%</Text>
          </View>
          <View style={s.progressTrack}>
            <Animated.View
              style={[s.progressFill, {
                width: uploadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]}
            />
          </View>
        </View>
      )}

      {photos.length === 0 && !isUploading && (
        <TouchableOpacity style={s.dropZone} onPress={pickPhotos}>
          <Ionicons name="cloud-upload-outline" size={44} color={Colors.textTertiary} />
          <Text style={s.dropTitle}>Tap to add photos</Text>
          <Text style={s.dropSub}>JPG, PNG · Max 8 photos · 10 MB each</Text>
        </TouchableOpacity>
      )}

      {photos.length > 0 && !isUploading && (
        <View style={s.uploadBtnRow}>
          <TouchableOpacity style={s.uploadBtn} onPress={pickPhotos}>
            <Ionicons name="images-outline" size={18} color={Colors.primary} />
            <Text style={s.uploadBtnText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.uploadBtn} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={18} color={Colors.primary} />
            <Text style={s.uploadBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Documents */}
      <Text style={s.label}>Ownership Documents</Text>
      <TouchableOpacity style={s.docRow}>
        <View style={s.docIcon}>
          <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.docTitle}>Upload C of O, Survey, Deed…</Text>
          <Text style={s.docSub}>PDF, JPG or PNG · Max 20 MB</Text>
        </View>
        <Ionicons name="cloud-upload-outline" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  const StepPrice = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>Set Your Price</Text>
      <Text style={s.stepSub}>You can always edit this after listing</Text>

      {/* Price type toggle */}
      <View style={s.priceToggle}>
        {(['total', 'per_unit'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.priceToggleItem, priceType === t && s.priceToggleActive]}
            onPress={() => setPriceType(t)}
          >
            <Text style={[s.priceToggleText, priceType === t && s.priceToggleTextActive]}>
              {t === 'total' ? 'Total Price' : `Per ${sizeUnit}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Price (₦) *</Text>
      <View style={s.priceInputWrap}>
        <Text style={s.pricePrefix}>₦</Text>
        <TextInput
          style={s.priceInput}
          value={price}
          onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
          placeholder="0"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
        />
      </View>
      {price.length > 0 && (
        <Text style={s.priceFormatted}>
          ₦{fmtPrice(price)}{priceType === 'per_unit' ? ` per ${sizeUnit}` : ' total'}
        </Text>
      )}

      {/* Tips */}
      <View style={s.tipCard}>
        <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
        <Text style={s.tipText}>
          Similar listings in this area are priced between{' '}
          <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>₦2M – ₦8M</Text>.
          Competitive pricing gets faster responses.
        </Text>
      </View>
    </View>
  );

  const StepReview = () => {
    const cat = CATEGORY_OPTIONS.find((c) => c.key === category);
    const fields = [
      { icon: 'grid-outline' as IoniconsName,     label: 'Type',     value: cat?.label ?? '—' },
      { icon: 'text-outline' as IoniconsName,      label: 'Title',    value: title || '—' },
      { icon: 'expand-outline' as IoniconsName,    label: 'Size',     value: size ? `${size} ${sizeUnit}` : '—' },
      { icon: 'location-outline' as IoniconsName,  label: 'State',    value: state || '—' },
      { icon: 'map-outline' as IoniconsName,       label: 'Location', value: location || '—' },
      { icon: 'cash-outline' as IoniconsName,      label: 'Price',    value: price ? `₦${fmtPrice(price)}` : '—' },
      { icon: 'images-outline' as IoniconsName,    label: 'Photos',   value: `${photos.length} added` },
    ];

    return (
      <View style={s.stepWrap}>
        <Text style={s.stepTitle}>Review & Submit</Text>
        <Text style={s.stepSub}>Check everything looks right before publishing</Text>

        {/* Photo strip */}
        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.reviewPhotoStrip}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={s.reviewPhoto} />
            ))}
          </ScrollView>
        )}

        {/* Summary card */}
        <View style={s.reviewCard}>
          {fields.map((f, i) => (
            <View key={f.label} style={[s.reviewRow, i < fields.length - 1 && s.reviewRowBorder]}>
              <View style={s.reviewIconWrap}>
                <Ionicons name={f.icon} size={15} color={Colors.primary} />
              </View>
              <Text style={s.reviewLabel}>{f.label}</Text>
              <Text style={s.reviewVal} numberOfLines={1}>{f.value}</Text>
              {f.value !== '—' && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              )}
            </View>
          ))}
        </View>

        <View style={s.termsNote}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.textTertiary} />
          <Text style={s.termsText}>
            By submitting you agree to Landrush's{' '}
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Listing Guidelines</Text>
            {' '}and{' '}
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Terms of Service</Text>.
          </Text>
        </View>
      </View>
    );
  };

  const RENDERERS = [StepType, StepDetails, StepLocation, StepMedia, StepPrice, StepReview];
  const StepComponent = RENDERERS[step];

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={s.headerDecoA} />
        <View style={s.headerRow}>
          {step > 0 ? (
            <TouchableOpacity style={s.headerBackBtn} onPress={goBack}>
              <Ionicons name="chevron-back" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Post a Listing</Text>
            {draftSaved && (
              <View style={s.draftPill}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.lime} />
                <Text style={s.draftText}>Draft saved</Text>
              </View>
            )}
          </View>
          <Text style={s.headerStep}>{step + 1}/{STEPS.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={s.progressBar}>
          <Animated.View
            style={[s.progressBarFill, {
              width: progAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}
          />
        </View>
        <Text style={s.stepLabel}>{STEPS[step]}</Text>
      </View>

      {/* Step content */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <StepComponent />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <TouchableOpacity
          style={s.nextBtn}
          onPress={goNext}
          activeOpacity={0.88}
        >
          <Text style={s.nextBtnText}>
            {step === STEPS.length - 1 ? 'Submit Listing' : 'Continue'}
          </Text>
          <Ionicons
            name={step === STEPS.length - 1 ? 'checkmark-circle-outline' : 'arrow-forward'}
            size={18}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(159,187,68,0.06)',
    top: -60,
    right: -40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  draftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(159,187,68,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  draftText: {
    fontSize: 10,
    color: Colors.lime,
    fontWeight: '600',
  },
  headerStep: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.lime,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.lime,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Scroll ────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  stepWrap: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stepSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },

  // ── Category cards ────────────────────────────────────────────
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: { flex: 1 },
  catLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  catDesc:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // ── Inputs ────────────────────────────────────────────────────
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textarea: {
    height: 120,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  sizeRow: { flexDirection: 'row', gap: Spacing.md },
  unitRow: { gap: Spacing.sm, marginTop: Spacing.sm },
  unitChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  unitChipActive: { borderColor: Colors.lime, backgroundColor: `${Colors.lime}18` },
  unitText:       { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  unitTextActive: { color: Colors.primary, fontWeight: '700' },

  // ── Location ──────────────────────────────────────────────────
  stateRow: { gap: Spacing.sm, marginBottom: Spacing.md },
  stateChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  stateChipActive: { borderColor: Colors.lime, backgroundColor: `${Colors.lime}18` },
  stateText:       { fontSize: FontSize.sm, color: Colors.textSecondary },
  stateTextActive: { color: Colors.primary, fontWeight: '700' },
  mapPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  mapPickText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },

  // ── Media ─────────────────────────────────────────────────────
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  photoCell: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    position: 'relative',
  },
  photoImg: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  addMoreCell: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  progressWrap:   { gap: 6, marginBottom: Spacing.md },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:  { fontSize: FontSize.sm, color: Colors.textSecondary },
  progressPct:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  progressTrack:  { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: Colors.lime, borderRadius: 3 },
  dropZone: {
    height: 180,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  dropTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  dropSub:   { fontSize: FontSize.xs, color: Colors.textTertiary },
  uploadBtnRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 46,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  uploadBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.primary },
  docSub:   { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },

  // ── Price ─────────────────────────────────────────────────────
  priceToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginBottom: Spacing.sm,
  },
  priceToggleItem: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  priceToggleActive: {
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  priceToggleText:       { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  priceToggleTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  pricePrefix: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  priceInput:  { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  priceFormatted: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: '#FFF8E1',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // ── Review ────────────────────────────────────────────────────
  reviewPhotoStrip: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  reviewPhoto: {
    width: 100,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  reviewRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  reviewIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 64 },
  reviewVal:   { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  termsNote: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginTop: Spacing.xl,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.xl,
  },
  nextBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
