import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ListingCategory } from '../../src/types/listing';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const STEPS = ['Category', 'Details', 'Location', 'Media', 'Price', 'Review'];

const categoryOptions: { key: ListingCategory; label: string; description: string; icon: IoniconsName }[] = [
  { key: 'lease', label: 'Lease', description: 'Land available for temporary use', icon: 'leaf' },
  { key: 'sale', label: 'Sale', description: 'Land available for purchase', icon: 'home' },
  { key: 'distress', label: 'Distress Sale', description: 'Urgent sale below market value', icon: 'flash' },
];

const sizeUnits = ['Plot', 'Acres', 'Hectares'];

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [category, setCategory] = useState<ListingCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState('Plot');
  const [leaseDuration, setLeaseDuration] = useState('');

  const handleNext = () => {
    if (currentStep === 0 && !category) {
      Alert.alert('Select Category', 'Please select a listing category.');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(
        'Listing submitted successfully!',
        'Your listing is now live on Landrush.',
        [{ text: 'Go to Home', onPress: () => router.replace('/(tabs)') }],
      );
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepDot,
              index <= currentStep ? styles.stepDotActive : styles.stepDotInactive,
            ]}
          >
            {index < currentStep ? (
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            ) : (
              <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>
                {index + 1}
              </Text>
            )}
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep ? styles.stepLineActive : styles.stepLineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderCategoryStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What type of listing?</Text>
      <Text style={styles.stepSubtitle}>Select the category that best describes your listing</Text>
      {categoryOptions.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.categoryOption, category === opt.key && styles.categoryOptionActive]}
          onPress={() => setCategory(opt.key)}
        >
          <View style={[styles.categoryIcon, category === opt.key && styles.categoryIconActive]}>
            <Ionicons
              name={opt.icon}
              size={24}
              color={category === opt.key ? Colors.textPrimary : Colors.primary}
            />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryLabel}>{opt.label}</Text>
            <Text style={styles.categoryDesc}>{opt.description}</Text>
          </View>
          <View style={[styles.radioOuter, category === opt.key && styles.radioOuterActive]}>
            {category === opt.key && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Listing Details</Text>
      <Text style={styles.inputLabel}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., 12 Acres of Farmland"
        placeholderTextColor={Colors.textTertiary}
      />
      <Text style={styles.inputLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the land, its features, and potential uses..."
        placeholderTextColor={Colors.textTertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text style={styles.inputLabel}>Land Size</Text>
      <View style={styles.sizeRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={size}
          onChangeText={setSize}
          placeholder="Enter size"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
        />
        <View style={styles.unitSelector}>
          {sizeUnits.map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[styles.unitChip, sizeUnit === unit && styles.unitChipActive]}
              onPress={() => setSizeUnit(unit)}
            >
              <Text style={[styles.unitText, sizeUnit === unit && styles.unitTextActive]}>
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {category === 'lease' && (
        <>
          <Text style={styles.inputLabel}>Lease Duration</Text>
          <TextInput
            style={styles.input}
            value={leaseDuration}
            onChangeText={setLeaseDuration}
            placeholder="e.g., 2 years"
            placeholderTextColor={Colors.textTertiary}
          />
        </>
      )}
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.inputLabel}>State</Text>
      <TextInput
        style={styles.input}
        value={state}
        onChangeText={setState}
        placeholder="Select state"
        placeholderTextColor={Colors.textTertiary}
      />
      <Text style={styles.inputLabel}>Address / Landmark</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter location details"
        placeholderTextColor={Colors.textTertiary}
      />
      <TouchableOpacity style={styles.mapPickerButton}>
        <Ionicons name="location" size={20} color={Colors.primary} />
        <Text style={styles.mapPickerText}>Pick location on map</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMediaStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Photos & Documents</Text>
      <Text style={styles.stepSubtitle}>Add photos of the land and any ownership documents</Text>
      <TouchableOpacity style={styles.uploadArea}>
        <Ionicons name="cloud-upload-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.uploadText}>Tap to upload photos</Text>
        <Text style={styles.uploadSubtext}>JPG, PNG up to 10MB each</Text>
      </TouchableOpacity>
      <Text style={styles.inputLabel}>Verification Documents</Text>
      <TouchableOpacity style={styles.documentUpload}>
        <Ionicons name="document-outline" size={24} color={Colors.primary} />
        <Text style={styles.documentText}>Upload ownership documents</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPriceStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set Your Price</Text>
      <Text style={styles.inputLabel}>Price ({'\u20A6'})</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="numeric"
      />
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review Listing</Text>
      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Category</Text>
          <Text style={styles.reviewValue}>{category}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Title</Text>
          <Text style={styles.reviewValue}>{title || '-'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Size</Text>
          <Text style={styles.reviewValue}>{size ? `${size} ${sizeUnit}` : '-'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Location</Text>
          <Text style={styles.reviewValue}>{location || '-'}, {state || '-'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Price</Text>
          <Text style={styles.reviewValue}>{price ? `₦${parseInt(price).toLocaleString()}` : '-'}</Text>
        </View>
      </View>
    </View>
  );

  const stepRenderers = [
    renderCategoryStep,
    renderDetailsStep,
    renderLocationStep,
    renderMediaStep,
    renderPriceStep,
    renderReviewStep,
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <Text style={styles.headerStep}>Step {currentStep + 1} of {STEPS.length}</Text>
      </View>

      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {stepRenderers[currentStep]()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === STEPS.length - 1 ? 'Submit Listing' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerStep: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.lime,
  },
  stepDotInactive: {
    backgroundColor: Colors.border,
  },
  stepNumber: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLine: {
    width: 28,
    height: 2,
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: Colors.lime,
  },
  stepLineInactive: {
    backgroundColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: Spacing.xl,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  categoryOptionActive: {
    borderColor: Colors.lime,
    backgroundColor: `${Colors.lime}15`,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.lime}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconActive: {
    backgroundColor: Colors.lime,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.lime,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.lime,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.lg,
  },
  sizeRow: {
    gap: Spacing.md,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  unitChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  unitText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  unitTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  mapPickerText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadArea: {
    height: 180,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  uploadText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  documentUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  documentText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  reviewValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
