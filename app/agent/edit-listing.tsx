import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useListing } from '../../src/hooks/useListings';
import type { ListingCategory } from '../../src/types/listing';

const CATEGORIES = ['sale', 'lease', 'distress'] as ListingCategory[];
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
  'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function EditListing() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: listing, isLoading } = useListing(listingId ?? '');

  // Form state
  const [category, setCategory] = useState<ListingCategory>('sale');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState('acres');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with listing data
  useEffect(() => {
    if (listing) {
      setCategory(listing.category);
      setTitle(listing.title);
      setDescription(listing.description);
      setState(listing.state);
      setLocation(listing.location);
      setSize(listing.size.toString());
      setSizeUnit(listing.sizeUnit);
      setPrice(listing.price.toString());
      setPriceUnit(listing.priceUnit);
      setLeaseDuration(listing.leaseDuration || '');
    }
  }, [listing]);

  const handleSaveListing = async () => {
    // Validation
    if (!title.trim() || !description.trim() || !state || !location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call update mutation from useListings
      // const result = await updateListing.mutate({
      //   id: listingId,
      //   category,
      //   title,
      //   description,
      //   state,
      //   location,
      //   size: parseFloat(size),
      //   sizeUnit,
      //   price: parseFloat(price),
      //   priceUnit,
      //   leaseDuration: category === 'lease' ? leaseDuration : undefined,
      // });

      Alert.alert('Success', 'Listing updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ── Form Sections ──────────────────────────────────── */}

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Type</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && { backgroundColor: colors.primary },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat && { color: colors.white },
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Fertile Farmland in Lagos"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Describe the property, features, and conditions..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.label}>State *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowStateDropdown(!showStateDropdown)}
        >
          <Text style={[styles.inputText, { color: state ? colors.text : colors.textSecondary }]}>
            {state || 'Select state'}
          </Text>
          <Ionicons
            name={showStateDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showStateDropdown && (
          <View style={styles.dropdown}>
            {NIGERIAN_STATES.map((st) => (
              <TouchableOpacity
                key={st}
                style={styles.dropdownItem}
                onPress={() => {
                  setState(st);
                  setShowStateDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Location Detail */}
      <View style={styles.section}>
        <Text style={styles.label}>Location Details *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Otta, Ogun State"
          placeholderTextColor={colors.textSecondary}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Size */}
      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: Spacing.md }]}>
          <Text style={styles.label}>Size *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={size}
            onChangeText={setSize}
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Unit</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => {
              // TODO: Show unit picker
            }}
          >
            <Text style={styles.inputText}>{sizeUnit}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Price */}
      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: Spacing.md }]}>
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Per</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., year"
            placeholderTextColor={colors.textSecondary}
            value={priceUnit}
            onChangeText={setPriceUnit}
          />
        </View>
      </View>

      {/* Lease Duration (conditional) */}
      {category === 'lease' && (
        <View style={styles.section}>
          <Text style={styles.label}>Lease Duration</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1-5 years"
            placeholderTextColor={colors.textSecondary}
            value={leaseDuration}
            onChangeText={setLeaseDuration}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.border }]}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSaveListing}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.white }]}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
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
    section: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    row: {
      flexDirection: 'row',
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      fontSize: FontSize.sm,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    inputText: {
      color: colors.text,
      fontSize: FontSize.sm,
    },
    descriptionInput: {
      textAlignVertical: 'top',
      height: 100,
    },
    categoryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    categoryButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    categoryButtonText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.text,
    },
    dropdown: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: Spacing.xs,
      maxHeight: 200,
    },
    dropdownItem: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemText: {
      fontSize: FontSize.sm,
      color: colors.text,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    button: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    buttonText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
    },
  });
