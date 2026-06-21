import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Find land that fits your vision',
    description:
      'Search verified land listings across Nigeria. Filter by type, price, location, and size to find exactly what you need.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  },
  {
    id: '2',
    title: 'Know more before making a move',
    description:
      'View listing details, uploaded documents, map locations, and verification indicators before scheduling inspections.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  },
  {
    id: '3',
    title: 'Plan inspections around your schedule',
    description:
      'Coordinate inspection times directly with agents or landowners without unnecessary back-and-forth.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.imageSection}>
        <Image source={{ uri: item.image }} style={styles.slideImage} />
      </View>
      <View style={styles.textSection}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleNext}>
          <Text style={styles.getStartedText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.onboardingBg,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
  },
  imageSection: {
    height: height * 0.5,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textSection: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
  },
  pagination: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: Colors.border,
  },
  slideTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: Spacing.lg,
  },
  slideDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 50,
  },
  getStartedButton: {
    backgroundColor: Colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  getStartedText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
