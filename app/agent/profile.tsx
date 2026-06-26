import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useAuthStore } from '../../src/store/auth';

export default function AgentProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('Experienced real estate agent with 10+ years in the industry');
  const [specializations, setSpecializations] = useState(['Farmland', 'Commercial']);
  const [newSpecialization, setNewSpecialization] = useState('');

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Agent';
  const initials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase();

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setSpecializations([...specializations, newSpecialization]);
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const handleSaveProfile = () => {
    // TODO: Call update profile mutation
    Alert.alert('Success', 'Profile updated');
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}>
          <Text style={[styles.headerAction, { color: colors.primary }]}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Avatar Card ────────────────────────────────────── */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarWrap}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {isEditing && (
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera-outline" size={14} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.avatarInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.role}>Landrush Agent</Text>
        </View>
      </View>

      {/* ── Contact Info ────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Bio ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        {isEditing ? (
          <TextInput
            style={styles.bioInput}
            placeholder="Tell buyers about yourself..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
          />
        ) : (
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        )}
      </View>

      {/* ── Specializations ────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.specHeader}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          {isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isEditing && (
          <View style={styles.addSpecInput}>
            <TextInput
              style={styles.specInput}
              placeholder="Add specialization..."
              placeholderTextColor={colors.textSecondary}
              value={newSpecialization}
              onChangeText={setNewSpecialization}
            />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddSpecialization}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.specTags}>
          {specializations.map((spec, index) => (
            <View key={index} style={[styles.specTag, { backgroundColor: colors.lime + '20' }]}>
              <Text style={[styles.specTagText, { color: colors.lime }]}>{spec}</Text>
              {isEditing && (
                <TouchableOpacity onPress={() => handleRemoveSpecialization(index)}>
                  <Ionicons name="close" size={16} color={colors.lime} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ── Certifications ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.certCard}>
          <View style={styles.certItem}>
            <View style={[styles.certBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.certInfo}>
              <Text style={styles.certName}>ID Verified</Text>
              <Text style={styles.certDate}>Verified on Jan 15, 2026</Text>
            </View>
          </View>
          <View style={[styles.certItem, { marginTop: Spacing.md }]}>
            <View style={[styles.certBadge, { backgroundColor: colors.lime + '15' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.lime} />
            </View>
            <View style={styles.certInfo}>
              <Text style={styles.certName}>Phone Verified</Text>
              <Text style={styles.certDate}>Verified on Jan 10, 2026</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Stats ──────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>127</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
        </View>
      </View>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
    },
    headerAction: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
    },
    avatarCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      ...Shadow.sm,
    },
    avatarWrap: {
      position: 'relative',
      marginRight: Spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.white,
    },
    editAvatarBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInfo: {
      flex: 1,
    },
    displayName: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    role: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    section: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    specHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      ...Shadow.xs,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoContent: {
      marginLeft: Spacing.md,
      flex: 1,
    },
    infoLabel: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    infoValue: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.text,
    },
    bioCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      ...Shadow.xs,
    },
    bioText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.text,
      lineHeight: 20,
    },
    bioInput: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      fontSize: FontSize.sm,
      color: colors.text,
      textAlignVertical: 'top',
      ...Shadow.xs,
    },
    addSpecInput: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    specInput: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: FontSize.sm,
      color: colors.text,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    specTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    specTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      gap: Spacing.xs,
    },
    specTagText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semibold,
    },
    certCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      ...Shadow.xs,
    },
    certItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    certBadge: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    certInfo: {
      flex: 1,
    },
    certName: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    certDate: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      alignItems: 'center',
      ...Shadow.xs,
    },
    statValue: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.primary,
      marginBottom: Spacing.xs,
    },
    statLabel: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
  });
