import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { useAuthStore } from '../src/store/auth';

export default function PersonalInformationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [nin, setNin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!firstName || !lastName || !email || !phone) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, firstName, lastName, email, phone }, 'mock-jwt-token');
      }
      setIsSaving(false);
      Alert.alert('Saved', 'Your information has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 900);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Basic Details</Text>

        <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+234 000 000 0000"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="phone-pad"
        />

        <Text style={[styles.sectionLabel, { marginTop: Spacing.xxxl }]}>Identity</Text>

        <Text style={styles.label}>NIN <Text style={styles.optional}>(Optional)</Text></Text>
        <TextInput
          style={styles.input}
          value={nin}
          onChangeText={setNin}
          placeholder="Enter NIN"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
          maxLength={11}
        />

        <Text style={styles.hint}>
          Adding your NIN enables verification and unlocks agent-level features.
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
    paddingTop: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  required: {
    color: Colors.error,
  },
  optional: {
    color: Colors.textTertiary,
    fontWeight: '400',
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
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.lime,
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
