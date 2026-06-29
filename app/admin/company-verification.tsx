import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { triggerHaptic } from '../../src/utils/haptics';

// Mock data - replace with API call
const PENDING_REGISTRATIONS = [
  {
    id: '1',
    companyName: 'Premium Real Estate Ltd',
    companyType: 'broker',
    agentName: 'John Doe',
    email: 'john@example.com',
    phone: '+234 800 123 4567',
    yearsInBusiness: '5',
    registrationNumber: 'CAC/2019/12345',
    licenseNumber: 'REA/2020/98765',
    submittedDate: '2024-06-28',
  },
  {
    id: '2',
    companyName: 'Innovative Properties',
    companyType: 'agent',
    agentName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+234 801 987 6543',
    yearsInBusiness: '3',
    registrationNumber: 'CAC/2021/54321',
    licenseNumber: 'REA/2021/12345',
    submittedDate: '2024-06-27',
  },
];

export default function CompanyVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const tabs = ['pending', 'approved', 'rejected'] as const;

  const handleApprove = (company: any) => {
    Alert.alert(
      'Approve Company?',
      `Do you want to approve ${company.companyName} for verification?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => {
            triggerHaptic('success');
            Alert.alert('Success', `${company.companyName} has been verified! ✨`);
          },
        },
      ]
    );
  };

  const handleReject = (company: any) => {
    Alert.alert(
      'Reject Company?',
      `Provide a reason for rejecting ${company.companyName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('warning');
            Alert.alert('Rejected', 'Company registration has been rejected.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Company Verification
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && [
                styles.tabActive,
                { borderBottomColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab
                  ? { color: colors.primary }
                  : { color: colors.textSecondary },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {tab === 'pending' && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.badgeText}>
                  {PENDING_REGISTRATIONS.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'pending' ? PENDING_REGISTRATIONS : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CompanyCard
            company={item}
            colors={colors}
            styles={styles}
            index={index}
            onApprove={() => handleApprove(item)}
            onReject={() => handleReject(item)}
            isAdmin
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {activeTab === 'pending' ? 'All Caught Up!' : 'No Companies'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {activeTab === 'pending'
                ? 'No pending verifications'
                : `No ${activeTab} companies`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function CompanyCard({
  company,
  colors,
  styles,
  index,
  onApprove,
  onReject,
  isAdmin,
}: any) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      style={[styles.companyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.companyIcon,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Ionicons
              name={
                company.companyType === 'broker'
                  ? 'business'
                  : 'person-circle'
              }
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={[styles.companyName, { color: colors.textPrimary }]}>
              {company.companyName}
            </Text>
            <Text style={[styles.agentName, { color: colors.textSecondary }]}>
              {company.agentName}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
            {company.companyType}
          </Text>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <DetailItem
          label="Email"
          value={company.email}
          colors={colors}
          icon="mail"
        />
        <DetailItem
          label="Phone"
          value={company.phone}
          colors={colors}
          icon="call"
        />
        <DetailItem
          label="Years in Business"
          value={`${company.yearsInBusiness} years`}
          colors={colors}
          icon="calendar"
        />
        <DetailItem
          label="Submitted"
          value={company.submittedDate}
          colors={colors}
          icon="time"
        />
        <DetailItem
          label="Registration #"
          value={company.registrationNumber}
          colors={colors}
          icon="document"
        />
        <DetailItem
          label="License #"
          value={company.licenseNumber}
          colors={colors}
          icon="shield-checkmark"
        />
      </View>

      {/* Action Buttons */}
      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.rejectBtn, { borderColor: colors.error }]}
            onPress={onReject}
          >
            <Ionicons name="close-circle" size={18} color={colors.error} />
            <Text style={[styles.rejectBtnText, { color: colors.error }]}>
              Reject
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveBtn, { backgroundColor: colors.primary }]}
            onPress={onApprove}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

function DetailItem({
  label,
  value,
  colors,
  icon,
}: any) {
  return (
    <View style={{ gap: Spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
        <Ionicons name={icon} size={14} color={colors.textSecondary} />
        <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: FontSize.sm, color: colors.textPrimary, fontWeight: '600' }}>
        {value}
      </Text>
    </View>
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
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
    },
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      paddingHorizontal: Spacing.lg,
    },
    tab: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      gap: Spacing.sm,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomWidth: 2,
    },
    tabText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    badgeText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: '#FFF',
    },
    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      gap: Spacing.lg,
    },
    companyCard: {
      borderWidth: 1,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      gap: Spacing.md,
      alignItems: 'center',
    },
    companyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardHeaderInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
    agentName: {
      fontSize: FontSize.xs,
      marginTop: Spacing.xs,
    },
    typeBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    typeBadgeText: {
      fontSize: FontSize.xs,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    detailsGrid: {
      gap: Spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    rejectBtn: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    rejectBtnText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
    approveBtn: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    approveBtnText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      color: '#FFF',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: Spacing.md,
    },
    emptyTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
    },
    emptySubtitle: {
      fontSize: FontSize.sm,
    },
  });
