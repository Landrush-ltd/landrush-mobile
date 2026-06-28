import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TutorialStep } from '../components/TutorialOverlay';

const TUTORIAL_STORAGE_KEY = 'landrush_tutorial_completed';

interface TutorialContextType {
  currentStep: number;
  isVisible: boolean;
  currentStepData: TutorialStep | null;
  hasCompletedTutorial: boolean;
  startTutorial: () => void;
  skipTutorial: () => void;
  nextStep: () => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Tutorial steps for new users
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Landrush',
    description: 'Your trusted platform for buying, selling, and leasing land in Nigeria.',
    target: 'search',
    hint: 'Swipe through the app to explore available land listings',
    icon: 'home-outline',
  },
  {
    id: 'search',
    title: '🔍 Search & Explore',
    description: 'Use the search bar to find land by location, size, or price.',
    target: 'search',
    hint: 'Type a location, state, or property type to filter listings',
    icon: 'search-outline',
  },
  {
    id: 'categories',
    title: '📂 Browse by Category',
    description: 'Filter listings by type: Buy, Lease, or Distress sales.',
    target: 'categories',
    hint: 'Tap any category to see relevant listings',
    icon: 'grid-outline',
  },
  {
    id: 'tap_card',
    title: '👆 Tap for Details',
    description: 'Tap any property card to view full details and images.',
    target: 'card',
    hint: 'See property info, agent details, and contact options',
    icon: 'image-outline',
  },
  {
    id: 'long_press',
    title: '📌 Long-press to Preview',
    description: 'Hold down on a card to see a quick preview without navigating away.',
    target: 'longpress',
    hint: 'Perfect for browsing multiple properties quickly',
    icon: 'eye-outline',
  },
  {
    id: 'save',
    title: '❤️ Save Your Favorites',
    description: 'Tap the heart icon to save properties for later.',
    target: 'heart',
    hint: 'Your saved listings appear in your profile',
    icon: 'heart-outline',
  },
  {
    id: 'create',
    title: '📝 Post Your Property',
    description: 'Use the create button to list your own property on Landrush.',
    target: 'create',
    hint: 'Fill in details about your land in 6 easy steps',
    icon: 'add-circle-outline',
  },
  {
    id: 'profile',
    title: '👤 Your Profile',
    description: 'Manage your account, saved listings, and customize your avatar.',
    target: 'profile',
    hint: 'Access settings, notifications, and verification here',
    icon: 'person-outline',
  },
  {
    id: 'done',
    title: '🎉 You\'re All Set!',
    description: 'Start exploring amazing land opportunities on Landrush today.',
    target: 'search',
    hint: 'Tap Next to close this tutorial anytime',
    icon: 'checkmark-circle-outline',
  },
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  // Check if user has completed tutorial
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        if (completed === 'true') {
          setHasCompletedTutorial(true);
        } else {
          // Auto-start tutorial for new users
          startTutorial();
        }
      } catch (error) {
        console.debug('Failed to check tutorial status', error);
        startTutorial();
      }
    };

    checkTutorialStatus();
  }, []);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const skipTutorial = async () => {
    setIsVisible(false);
    setHasCompletedTutorial(true);
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (error) {
      console.debug('Failed to save tutorial completion', error);
    }
  };

  const nextStep = async () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial complete
      await skipTutorial();
    }
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch (error) {
      console.debug('Failed to reset tutorial', error);
    }
    setCurrentStep(0);
    setIsVisible(true);
    setHasCompletedTutorial(false);
  };

  const currentStepData = isVisible ? TUTORIAL_STEPS[currentStep] || null : null;

  return (
    <TutorialContext.Provider
      value={{
        currentStep,
        isVisible,
        currentStepData,
        hasCompletedTutorial,
        startTutorial,
        skipTutorial,
        nextStep,
        resetTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}
