import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import type { ListingCategory } from '../../src/types/listing';
import { useCreateListing } from '../../src/hooks/useListings';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const STEPS = ['Type', 'Details', 'Location', 'Media', 'Price', 'Review'];

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
  const colors  = useColors();
  const s       = useMemo(() => makeStyles(colors), [colors]);
  const progAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const uploadAnim = useRef(new Animated.Value(0)).current;

  const CATEGORY_OPTIONS: { key: ListingCategory; label: string; desc: string; icon: IoniconsName; color: string; bg: string }[] = [
    { key: 'sale',     label: 'For Sale',      desc: 'Outright purchase of land',        icon: 'cart-outline',  color: colors.sale,     bg: `${colors.sale}18` },
    { key: 'lease',    label: 'For Lease',     desc: 'Temporary use for a fixed period', icon: 'create-outline',  color: colors.lease,    bg: `${colors.lease}18` },
    { key: 'distress', label: 'Distress Sale', desc: 'Urgent sale at reduced price',     icon: 'alert-circle-outline', color: colors.distress, bg: `${colors.distress}18` },
  ];

  const createListing = useCreateListing();

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
  const [leasePurpose, setLeasePurpose] = useState('');
  const [existingSetup, setExistingSetup] = useState<string[]>([]);
  const [actualValue, setActualValue] = useState('');
  const [price, setPrice]       = useState('');
  const [priceType, setPriceType] = useState<'total' | 'per_unit'>('total');
  const [photos, setPhotos]     = useState<string[]>([]);
  const [documents, setDocuments] = useState<{ type: string; uri: string }[]>([]);
  const [docTypeOpen, setDocTypeOpen] = useState(false);
  const [leasePurposeOpen, setLeasePurposeOpen] = useState(false);

  const LEASE_PURPOSES = [
    { id: 'poultry', label: '🐔 Poultry & Livestock Farming' },
    { id: 'fishpond', label: '🐟 Fish Pond / Aquaculture' },
    { id: 'crops', label: '🌾 Crop Farming' },
    { id: 'commercial', label: '🏪 Commercial / Residential' },
    { id: 'industrial', label: '🏭 Industrial Use' },
    { id: 'tourism', label: '🏨 Tourism / Hospitality' },
    { id: 'storage', label: '📦 Storage / Warehouse' },
    { id: 'other', label: '📋 Other Purpose' },
  ];

  const EXISTING_SETUPS = [
    { id: 'poultry_house', label: '🐔 Poultry House / Coop' },
    { id: 'fish_pond', label: '🐟 Fish Pond (Dug & Ready)' },
    { id: 'farm_equipment', label: '🚜 Farm Equipment & Tools' },
    { id: 'irrigation', label: '💧 Irrigation System' },
    { id: 'fence', label: '🚧 Fencing & Gates' },
    { id: 'storage_shed', label: '🏚️ Storage Shed / Barn' },
    { id: 'power', label: '⚡ Electricity / Solar' },
    { id: 'water', label: '💦 Water Well / Tank' },
  ];
  const [isUploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);
  const [draftSaved, setDraft]  = useState(false);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [stateQuery, setStateQuery] = useState('');

  const DOCUMENT_TYPES = [
    { id: 'coo', label: 'Certificate of Occupancy (C of O)' },
    { id: 'deed', label: 'Deed of Ownership' },
    { id: 'survey', label: 'Survey Plan' },
    { id: 'lease', label: 'Lease Agreement' },
    { id: 'other', label: 'Other Document' },
  ];
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

  const validateStep = (stepNum: number): string | null => {
    switch (stepNum) {
      case 0: // Type
        if (!category) return 'Please select a listing type';
        return null;

      case 1: // Details
        if (!title.trim()) return 'Please enter a listing title';
        if (!description.trim()) return 'Please enter a description';
        if (category === 'lease') {
          if (!leaseDur.trim()) return 'Please enter lease duration (e.g., 2 years)';
          if (!leasePurpose) return 'Please select intended use for lease';
        }
        return null;

      case 2: // Location
        if (!state) return 'Please select a state';
        if (!location.trim()) return 'Please enter a location/address';
        return null;

      case 3: // Media
        if (photos.length === 0) return 'Please upload at least 1 photo';
        return null;

      case 4: // Price
        if (!price.trim()) return 'Please enter a listing price';
        if (category === 'distress') {
          if (!actualValue.trim()) return 'Please enter actual market value';
          if (parseInt(price, 10) >= parseInt(actualValue, 10)) {
            return 'Listing price must be lower than actual value for distress sale';
          }
        }
        return null;

      case 5: // Review
        return null;

      default:
        return null;
    }
  };

  const validationError = useMemo(() => validateStep(step), [step, category, title, description, leaseDur, leasePurpose, state, location, photos.length, price, actualValue]);

  const goNext = () => {
    if (validationError) {
      Alert.alert('Missing Information', validationError);
      return;
    }
    if (step < STEPS.length - 1) { setDir(1); animateSlide(1, () => setStep((s) => s + 1)); }
    else {
      if (!category) return;
      createListing.mutate(
        {
          category,
          title,
          description,
          state,
          location,
          size: parseFloat(size) || 0,
          sizeUnit: sizeUnit.toLowerCase(),
          price: parseInt(price.replace(/,/g, ''), 10) || 0,
          priceUnit: category === 'lease' && leaseDur
            ? `per ${leaseDur}`
            : priceType === 'per_unit'
            ? `per ${sizeUnit.toLowerCase()}`
            : '',
          leaseDuration: leaseDur || undefined,
          mediaUris: [...photos, ...documents.map(d => d.uri)],
        },
        {
          onSuccess: () =>
            Alert.alert('Listing Submitted!', 'Your listing is under review and will go live shortly.', [
              { text: 'Go to Home', onPress: () => router.replace('/(tabs)') },
            ]),
          onError: (e: any) =>
            Alert.alert('Submission failed', e?.message ?? 'Please try again.'),
        },
      );
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
              <Ionicons name={opt.icon} size={22} color={active ? colors.white : opt.color} />
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
        key="title-input"
        style={s.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. 3 Plots of Land, Uyo GRA"
        placeholderTextColor={colors.textTertiary}
        editable={true}
        selectTextOnFocus={false}
        returnKeyType="next"
      />

      <Text style={s.label}>Description</Text>
      <TextInput
        key="description-input"
        style={[s.input, s.textarea]}
        value={description}
        onChangeText={setDesc}
        placeholder="Describe the land, access road, utilities, nearby landmarks…"
        placeholderTextColor={colors.textTertiary}
        editable={true}
        selectTextOnFocus={false}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        returnKeyType="default"
      />

      <Text style={s.label}>Land Size *</Text>
      <View style={s.sizeRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={size}
          onChangeText={setSize}
          placeholder="Enter size"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          editable={true}
          selectTextOnFocus={false}
          returnKeyType="next"
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
          <Text style={s.label}>Lease Duration *</Text>
          <TextInput
            style={s.input}
            value={leaseDur}
            onChangeText={setLeaseDur}
            placeholder="e.g. 2 years, 5 years"
            placeholderTextColor={colors.textTertiary}
            editable={true}
            selectTextOnFocus={false}
            returnKeyType="next"
          />

          <Text style={s.label}>Intended Use *</Text>
          <TouchableOpacity
            style={s.input}
            onPress={() => setLeasePurposeOpen(!leasePurposeOpen)}
          >
            <Text style={[s.inputText, { color: leasePurpose ? colors.text : colors.textTertiary }]}>
              {leasePurpose || 'Select intended use'}
            </Text>
            <Ionicons
              name={leasePurposeOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          {leasePurposeOpen && (
            <View style={s.purposeMenu}>
              {LEASE_PURPOSES.map((purpose) => (
                <TouchableOpacity
                  key={purpose.id}
                  style={s.purposeOption}
                  onPress={() => {
                    setLeasePurpose(purpose.label);
                    setLeasePurposeOpen(false);
                  }}
                >
                  <Text style={[s.purposeLabel, leasePurpose === purpose.label && s.purposeLabelActive]}>
                    {purpose.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[s.label, { marginTop: Spacing.lg }]}>What Comes With This Lease?</Text>
          <Text style={s.sublabel}>Select all that apply</Text>
          <View style={s.setupGrid}>
            {EXISTING_SETUPS.map((setup) => (
              <TouchableOpacity
                key={setup.id}
                style={[s.setupItem, existingSetup.includes(setup.id) && s.setupItemActive]}
                onPress={() => {
                  setExistingSetup((prev) =>
                    prev.includes(setup.id)
                      ? prev.filter((id) => id !== setup.id)
                      : [...prev, setup.id]
                  );
                }}
              >
                <Ionicons
                  name={existingSetup.includes(setup.id) ? 'checkbox' : 'checkbox-outline'}
                  size={20}
                  color={existingSetup.includes(setup.id) ? colors.primary : colors.textTertiary}
                />
                <Text style={[s.setupLabel, existingSetup.includes(setup.id) && s.setupLabelActive]}>
                  {setup.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const StepLocation = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>Location</Text>
      <Text style={s.stepSub}>Help buyers find your land</Text>

      <Text style={s.label}>State *</Text>
      <TouchableOpacity
        style={[s.statePickerBtn, state ? s.statePickerBtnFilled : undefined]}
        onPress={() => setStateModalOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="map-outline" size={18} color={state ? colors.primary : colors.textTertiary} />
        <Text style={[s.statePickerText, state ? s.statePickerTextFilled : undefined]}>
          {state || 'Select a state'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
      </TouchableOpacity>

      <Text style={s.label}>Area / Address</Text>
      <TextInput
        key="location-input"
        style={s.input}
        value={location}
        onChangeText={setLoc}
        placeholder="e.g. Behind High Court, Ikot Ekpene"
        placeholderTextColor={colors.textTertiary}
        editable={true}
        selectTextOnFocus={false}
        returnKeyType="next"
      />

      <TouchableOpacity style={s.mapPickBtn}>
        <Ionicons name="location-outline" size={18} color={colors.primary} />
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
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 8 && (
            <TouchableOpacity style={s.addMoreCell} onPress={pickPhotos}>
              <Ionicons name="add" size={28} color={colors.textTertiary} />
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
          <Ionicons name="cloud-upload-outline" size={44} color={colors.textTertiary} />
          <Text style={s.dropTitle}>Tap to add photos</Text>
          <Text style={s.dropSub}>JPG, PNG · Max 8 photos · 10 MB each</Text>
        </TouchableOpacity>
      )}

      {photos.length > 0 && !isUploading && (
        <View style={s.uploadBtnRow}>
          <TouchableOpacity style={s.uploadBtn} onPress={pickPhotos}>
            <Ionicons name="images-outline" size={18} color={colors.primary} />
            <Text style={s.uploadBtnText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.uploadBtn} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={18} color={colors.primary} />
            <Text style={s.uploadBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Documents */}
      <Text style={s.label}>Ownership Documents (Optional)</Text>

      {/* Document Type Selector */}
      {documents.length < 5 && (
        <>
          <TouchableOpacity
            style={s.docRow}
            onPress={() => setDocTypeOpen(!docTypeOpen)}
          >
            <View style={s.docIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.docTitle}>Add Ownership Document</Text>
              <Text style={s.docSub}>Certificate, Deed, Survey, Lease…</Text>
            </View>
            <Ionicons name={docTypeOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {docTypeOpen && (
            <View style={s.docTypeMenu}>
              {DOCUMENT_TYPES.map((docType) => (
                <TouchableOpacity
                  key={docType.id}
                  style={s.docTypeOption}
                  onPress={async () => {
                    setDocTypeOpen(false);
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      quality: 0.8,
                    });
                    if (!result.cancelled && result.assets?.[0]) {
                      setDocuments([...documents, { type: docType.label, uri: result.assets[0].uri }]);
                    }
                  }}
                >
                  <Text style={s.docTypeLabel}>{docType.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <View style={s.docList}>
          <Text style={s.docListTitle}>Uploaded Documents ({documents.length})</Text>
          {documents.map((doc, idx) => (
            <View key={idx} style={s.docItem}>
              <Ionicons name="document-attach-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={s.docItemType}>{doc.type}</Text>
                <Text style={s.docItemPath} numberOfLines={1}>{doc.uri.split('/').pop()}</Text>
              </View>
              <TouchableOpacity onPress={() => setDocuments(documents.filter((_, i) => i !== idx))}>
                <Ionicons name="close-circle" size={20} color={colors.red} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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

      {/* Distress Sale: Actual Value */}
      {category === 'distress' && (
        <>
          <Text style={s.label}>Actual Market Value (₦) *</Text>
          <Text style={s.sublabel}>What this property is normally worth</Text>
          <View style={s.priceInputWrap}>
            <Text style={s.pricePrefix}>₦</Text>
            <TextInput
              style={s.priceInput}
              value={actualValue}
              onChangeText={(t) => setActualValue(t.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 10,000,000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              editable={true}
              selectTextOnFocus={false}
              returnKeyType="next"
            />
          </View>
          {actualValue.length > 0 && (
            <Text style={s.priceFormatted}>
              ₦{fmtPrice(actualValue)}
            </Text>
          )}
        </>
      )}

      <Text style={s.label}>Listing Price (₦) *</Text>
      {category === 'distress' && <Text style={s.sublabel}>Your asking price (will show discount)</Text>}
      <View style={s.priceInputWrap}>
        <Text style={s.pricePrefix}>₦</Text>
        <TextInput
          key="price-input"
          style={s.priceInput}
          value={price}
          onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          editable={true}
          selectTextOnFocus={false}
          returnKeyType="done"
        />
      </View>
      {price.length > 0 && (
        <>
          <Text style={s.priceFormatted}>
            ₦{fmtPrice(price)}{priceType === 'per_unit' ? ` per ${sizeUnit}` : ' total'}
          </Text>
          {category === 'distress' && actualValue.length > 0 && (
            <>
              {parseInt(price, 10) < parseInt(actualValue, 10) ? (
                <View style={s.discountBadge}>
                  <Ionicons name="flash-outline" size={14} color={colors.white} />
                  <Text style={s.discountText}>
                    {Math.round(((parseInt(actualValue, 10) - parseInt(price, 10)) / parseInt(actualValue, 10)) * 100)}% OFF
                  </Text>
                </View>
              ) : (
                <Text style={s.priceWarning}>
                  Listing price should be lower than actual value for a distress sale
                </Text>
              )}
            </>
          )}
        </>
      )}

      {/* Tips */}
      <View style={s.tipCard}>
        <Ionicons name="bulb-outline" size={16} color={colors.warning} />
        <Text style={s.tipText}>
          Similar listings in this area are priced between{' '}
          <Text style={{ fontWeight: '700', color: colors.textPrimary }}>₦2M – ₦8M</Text>.
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
                <Ionicons name={f.icon} size={15} color={colors.primary} />
              </View>
              <Text style={s.reviewLabel}>{f.label}</Text>
              <Text style={s.reviewVal} numberOfLines={1}>{f.value}</Text>
              {f.value !== '—' && (
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              )}
            </View>
          ))}
        </View>

        <View style={s.termsNote}>
          <Ionicons name="information-circle-outline" size={15} color={colors.textTertiary} />
          <Text style={s.termsText}>
            By submitting you agree to Landrush's{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Listing Guidelines</Text>
            {' '}and{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text>.
          </Text>
        </View>
      </View>
    );
  };

  // Memoize step components to prevent unnecessary re-renders
  const MemoizedStepType = useMemo(() => React.memo(StepType), []);
  const MemoizedStepDetails = useMemo(() => React.memo(StepDetails), []);
  const MemoizedStepLocation = useMemo(() => React.memo(StepLocation), []);
  const MemoizedStepMedia = useMemo(() => React.memo(StepMedia), []);
  const MemoizedStepPrice = useMemo(() => React.memo(StepPrice), []);
  const MemoizedStepReview = useMemo(() => React.memo(StepReview), []);

  const RENDERERS = [MemoizedStepType, MemoizedStepDetails, MemoizedStepLocation, MemoizedStepMedia, MemoizedStepPrice, MemoizedStepReview];
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
              <Ionicons name="chevron-back" size={20} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Post a Listing</Text>
            {draftSaved && (
              <View style={s.draftPill}>
                <Ionicons name="checkmark-circle" size={11} color={colors.lime} />
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
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <StepComponent />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {validationError && (
          <Text style={s.validationError}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.red} /> {validationError}
          </Text>
        )}
        <TouchableOpacity
          style={[
            s.nextBtn,
            (createListing.isPending || validationError) && s.nextBtnDisabled,
          ]}
          onPress={goNext}
          activeOpacity={0.88}
          disabled={createListing.isPending || !!validationError}
        >
          <Text style={s.nextBtnText}>
            {createListing.isPending
              ? 'Submitting…'
              : step === STEPS.length - 1
              ? 'Submit Listing'
              : 'Continue'}
          </Text>
          <Ionicons
            name={step === STEPS.length - 1 ? 'checkmark-circle-outline' : 'arrow-forward'}
            size={18}
            color={createListing.isPending || validationError ? colors.textTertiary : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* State picker modal */}
      <Modal visible={stateModalOpen} animationType="slide" transparent onRequestClose={() => setStateModalOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => { setStateModalOpen(false); setStateQuery(''); }}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={s.modalSearch}>
              <Ionicons name="search-outline" size={16} color={colors.textTertiary} />
              <TextInput
                style={s.modalSearchInput}
                placeholder="Search states…"
                placeholderTextColor={colors.textTertiary}
                value={stateQuery}
                onChangeText={setStateQuery}
                autoFocus
              />
              {stateQuery.length > 0 && (
                <TouchableOpacity onPress={() => setStateQuery('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={NG_STATES.filter((st) => st.toLowerCase().includes(stateQuery.toLowerCase()))}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.stateOption}
                  onPress={() => { setState(item); setStateModalOpen(false); setStateQuery(''); }}
                >
                  <Text style={[s.stateOptionText, state === item && s.stateOptionActive]}>
                    {item}
                  </Text>
                  {state === item && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.lime} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={s.stateOptionSep} />}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── Header ────────────────────────────────────────────────────
    header: {
      backgroundColor: colors.textPrimary,
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
      color: colors.white,
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
      color: colors.lime,
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
      backgroundColor: colors.lime,
      borderRadius: 2,
    },
    stepLabel: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: colors.lime,
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
      color: colors.textPrimary,
    },
    stepSub: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      marginBottom: Spacing.md,
    },

    // ── Category cards ────────────────────────────────────────────
    catCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.white,
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
    catLabel: { fontSize: FontSize.lg, fontWeight: '700', color: colors.textPrimary },
    catDesc:  { fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 2 },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
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
      color: colors.textPrimary,
      marginTop: Spacing.lg,
      marginBottom: 6,
    },
    input: {
      height: 52,
      backgroundColor: colors.white,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.lg,
      fontSize: FontSize.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    unitChipActive: { borderColor: colors.lime, backgroundColor: `${colors.lime}18` },
    unitText:       { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '500' },
    unitTextActive: { color: colors.primary, fontWeight: '700' },

    // ── Location ──────────────────────────────────────────────────
    statePickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      height: 52,
      backgroundColor: colors.white,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.lg,
    },
    statePickerBtnFilled: {
      borderColor: colors.lime,
    },
    statePickerText: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.textTertiary,
    },
    statePickerTextFilled: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
      paddingTop: Spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    modalTitle: {
      fontSize: FontSize.lg,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    modalSearch: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      margin: Spacing.lg,
      paddingHorizontal: Spacing.md,
      height: 44,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.textPrimary,
    },
    stateOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
    },
    stateOptionText: {
      fontSize: FontSize.md,
      color: colors.textPrimary,
    },
    stateOptionActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    stateOptionSep: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginLeft: Spacing.xl,
    },
    mapPickBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.xl,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    mapPickText: { fontSize: FontSize.md, color: colors.primary, fontWeight: '600' },

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
    coverBadgeText: { fontSize: 9, color: colors.white, fontWeight: '700' },
    removeBtn: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.white,
      borderRadius: 10,
    },
    addMoreCell: {
      width: 90,
      height: 90,
      borderRadius: BorderRadius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.white,
    },
    progressWrap:   { gap: 6, marginBottom: Spacing.md },
    progressTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel:  { fontSize: FontSize.sm, color: colors.textSecondary },
    progressPct:    { fontSize: FontSize.sm, fontWeight: '700', color: colors.primary },
    progressTrack:  { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    progressFill:   { height: '100%', backgroundColor: colors.lime, borderRadius: 3 },
    dropZone: {
      height: 180,
      borderRadius: BorderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.white,
      marginBottom: Spacing.md,
    },
    dropTitle: { fontSize: FontSize.md, fontWeight: '600', color: colors.textSecondary },
    dropSub:   { fontSize: FontSize.xs, color: colors.textTertiary },
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
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    uploadBtnText: { fontSize: FontSize.md, color: colors.primary, fontWeight: '600' },
    docRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    docIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: `${colors.lime}18`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docTitle: { fontSize: FontSize.md, fontWeight: '600', color: colors.primary },
    docSub:   { fontSize: FontSize.xs, color: colors.textTertiary, marginTop: 2 },

    docTypeMenu: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      marginTop: Spacing.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    docTypeOption: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    docTypeLabel: {
      fontSize: FontSize.sm,
      color: colors.text,
    },

    purposeMenu: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      marginTop: Spacing.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    purposeOption: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    purposeLabel: {
      fontSize: FontSize.sm,
      color: colors.text,
    },
    purposeLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    inputText: {
      fontSize: FontSize.sm,
      color: colors.text,
    },

    sublabel: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
      marginTop: -Spacing.sm,
      marginBottom: Spacing.md,
    },

    setupGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    setupItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      gap: Spacing.sm,
    },
    setupItemActive: {
      backgroundColor: `${colors.primary}15`,
      borderColor: colors.primary,
    },
    setupLabel: {
      fontSize: FontSize.xs,
      color: colors.text,
      flex: 1,
    },
    setupLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },

    docList: {
      marginTop: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    docListTitle: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.md,
    },
    docItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    docItemType: {
      fontSize: FontSize.xs,
      fontWeight: '600',
      color: colors.text,
    },
    docItemPath: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
      marginTop: 2,
    },

    // ── Price ─────────────────────────────────────────────────────
    priceToggle: {
      flexDirection: 'row',
      backgroundColor: colors.background,
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
      backgroundColor: colors.white,
      ...Shadow.sm,
    },
    priceToggleText:       { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '500' },
    priceToggleTextActive: { color: colors.textPrimary, fontWeight: '700' },
    priceInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 56,
      backgroundColor: colors.white,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    pricePrefix: { fontSize: FontSize.xl, fontWeight: '700', color: colors.primary },
    priceInput:  { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: colors.textPrimary },
    priceFormatted: {
      fontSize: FontSize.md,
      color: colors.primary,
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
      color: colors.textSecondary,
      lineHeight: 20,
    },

    discountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.distress,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      marginTop: Spacing.md,
    },
    discountText: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.white,
    },
    priceWarning: {
      fontSize: FontSize.sm,
      color: colors.orange,
      fontStyle: 'italic',
      marginTop: Spacing.md,
      textAlign: 'center',
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
      backgroundColor: colors.white,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
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
      borderBottomColor: colors.borderLight,
    },
    reviewIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: `${colors.lime}18`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reviewLabel: { fontSize: FontSize.sm, color: colors.textSecondary, width: 64 },
    reviewVal:   { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: colors.textPrimary },
    termsNote: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'flex-start',
      marginTop: Spacing.xl,
    },
    termsText: {
      flex: 1,
      fontSize: FontSize.sm,
      color: colors.textTertiary,
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
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    nextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      height: 52,
      backgroundColor: colors.lime,
      borderRadius: BorderRadius.xl,
    },
    nextBtnText: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    nextBtnDisabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
    },
    validationError: {
      fontSize: FontSize.sm,
      color: colors.red,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.sm,
      fontWeight: '500',
    },
  });
}
