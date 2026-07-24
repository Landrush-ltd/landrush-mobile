import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../constants/theme';
import { ProgressBar } from './ProgressBar';
import { triggerHaptic } from '../utils/haptics';

interface CompanyRegistrationProps {
  onComplete?: (companyData: any) => void;
  onCancel?: () => void;
}

const STEPS = ['Company Info', 'Credentials', 'Documents', 'Review'];

export function CompanyRegistration({ onComplete, onCancel }: CompanyRegistrationProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: 'agent' as 'agent' | 'broker' | 'developer',
    yearsInBusiness: '',
    registrationNumber: '',
    licenseNumber: '',
    email: '',
    phone: '',
    website: '',
  });

  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (validateStep(step)) {
      triggerHaptic('light');
      setStep(step + 1);
    } else {
      triggerHaptic('warning');
      Alert.alert('Missing Fields', 'Please fill in all required fields');
    }
  };

  const handlePrev = () => {
    triggerHaptic('light');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    triggerHaptic('success');
    // Call API to submit registration
    if (onComplete) {
      onComplete(formData);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 0: // Company Info
        return !!(formData.companyName && formData.companyType && formData.yearsInBusiness);
      case 1: // Credentials
        return !!(formData.registrationNumber && formData.licenseNumber);
      case 2: // Documents
        return true; // Optional for now
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const progress = (step + 1) / STEPS.length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Register Company</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} color={colors.primary} height={6} />
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step {step + 1} of {STEPS.length}
        </Text>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 0 && <Step0CompanyInfo formData={formData} handleInputChange={handleInputChange} colors={colors} styles={styles} />}
        {step === 1 && <Step1Credentials formData={formData} handleInputChange={handleInputChange} colors={colors} styles={styles} />}
        {step === 2 && <Step2Documents formData={formData} colors={colors} styles={styles} />}
        {step === 3 && <Step3Review formData={formData} colors={colors} styles={styles} />}
      </ScrollView>

      {/* Buttons */}
      <View style={[styles.buttonSection, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={step === 0 ? onCancel : handlePrev}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={step === STEPS.length - 1 ? handleSubmit : handleNext}
        >
          <Text style={styles.primaryBtnText}>
            {step === STEPS.length - 1 ? 'Submit' : 'Next'}
          </Text>
          <Ionicons name={step === STEPS.length - 1 ? 'checkmark' : 'arrow-forward'} size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── STEP 0: Company Info ────────────────────────────────────── */
function Step0CompanyInfo({ formData, handleInputChange, colors, styles }: any) {
  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Tell us about your company
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Company Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Your company name"
          placeholderTextColor={colors.textTertiary}
          value={formData.companyName}
          onChangeText={(val) => handleInputChange('companyName', val)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Company Type *</Text>
        <View style={styles.typeRow}>
          {(['agent', 'broker', 'developer'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeBtn,
                {
                  backgroundColor: formData.companyType === type ? colors.primary : colors.surface,
                  borderColor: formData.companyType === type ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleInputChange('companyType', type)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: formData.companyType === type ? '#FFF' : colors.textPrimary },
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Years in Business *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="e.g., 5"
          placeholderTextColor={colors.textTertiary}
          keyboardType="number-pad"
          value={formData.yearsInBusiness}
          onChangeText={(val) => handleInputChange('yearsInBusiness', val)}
        />
      </View>
    </Animated.View>
  );
}

/* ── STEP 1: Credentials ──────────────────────────────────────── */
function Step1Credentials({ formData, handleInputChange, colors, styles }: any) {
  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Provide your credentials
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Registration Number *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="CAC registration number"
          placeholderTextColor={colors.textTertiary}
          value={formData.registrationNumber}
          onChangeText={(val) => handleInputChange('registrationNumber', val)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>License Number *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Professional license number"
          placeholderTextColor={colors.textTertiary}
          value={formData.licenseNumber}
          onChangeText={(val) => handleInputChange('licenseNumber', val)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="company@example.com"
          placeholderTextColor={colors.textTertiary}
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(val) => handleInputChange('email', val)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Phone Number *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="+234 800 000 0000"
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(val) => handleInputChange('phone', val)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Website (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="www.yourcompany.com"
          placeholderTextColor={colors.textTertiary}
          value={formData.website}
          onChangeText={(val) => handleInputChange('website', val)}
        />
      </View>
    </Animated.View>
  );
}

/* ── STEP 2: Documents ───────────────────────────────────────── */
function Step2Documents({ formData, colors, styles }: any) {
  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Upload documents
      </Text>

      <View style={[styles.documentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="document-outline" size={40} color={colors.primary} />
        <Text style={[styles.documentTitle, { color: colors.textPrimary }]}>Registration Document</Text>
        <Text style={[styles.documentSubtitle, { color: colors.textSecondary }]}>CAC Certificate or similar</Text>
        <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.documentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="document-outline" size={40} color={colors.lime} />
        <Text style={[styles.documentTitle, { color: colors.textPrimary }]}>License Document</Text>
        <Text style={[styles.documentSubtitle, { color: colors.textSecondary }]}>Professional license or permit</Text>
        <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.lime }]}>
          <Ionicons name="cloud-upload-outline" size={20} color="#000" />
          <Text style={[styles.uploadBtnText, { color: '#000' }]}>Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.documentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="image-outline" size={40} color={colors.lease} />
        <Text style={[styles.documentTitle, { color: colors.textPrimary }]}>Company Logo</Text>
        <Text style={[styles.documentSubtitle, { color: colors.textSecondary }]}>Your company logo or image</Text>
        <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.lease }]}>
          <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/* ── STEP 3: Review ──────────────────────────────────────────── */
function Step3Review({ formData, colors, styles }: any) {
  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Review your information
      </Text>

      <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Company Name</Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{formData.companyName}</Text>

        <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
          Company Type
        </Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>
          {formData.companyType.charAt(0).toUpperCase() + formData.companyType.slice(1)}
        </Text>

        <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
          Years in Business
        </Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{formData.yearsInBusiness} years</Text>

        <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
          Registration Number
        </Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{formData.registrationNumber}</Text>

        <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
          License Number
        </Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{formData.licenseNumber}</Text>

        <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
          Email
        </Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{formData.email}</Text>

        <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
          Phone
        </Text>
        <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{formData.phone}</Text>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Your information will be reviewed within 24-48 hours. You'll receive a notification once verified.
        </Text>
      </View>
    </Animated.View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
    },
    progressSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
    },
    progressText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.medium,
      fontWeight: '500',
      textAlign: 'center',
    },
    content: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    stepTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      marginBottom: Spacing.lg,
      letterSpacing: LetterSpacing.tight,
    },
    formGroup: {
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      marginBottom: Spacing.sm,
    },
    input: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      fontWeight: '400',
    },
    typeRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeBtnText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
    documentBox: {
      borderWidth: 1,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    documentTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
    documentSubtitle: {
      fontSize: FontSize.xs,
      marginBottom: Spacing.md,
    },
    uploadBtn: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      gap: Spacing.sm,
    },
    uploadBtnText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      color: '#FFF',
    },
    reviewCard: {
      borderWidth: 1,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    reviewLabel: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.medium,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    reviewValue: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      marginTop: Spacing.xs,
    },
    infoBox: {
      borderWidth: 1,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      flexDirection: 'row',
      gap: Spacing.md,
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
    buttonSection: {
      flexDirection: 'row',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderTopWidth: 1,
    },
    secondaryBtn: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
    primaryBtn: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    primaryBtnText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      color: '#FFF',
    },
  });
