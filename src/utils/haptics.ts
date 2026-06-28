import * as Haptics from 'expo-haptics';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback based on interaction type
 * Follows Emil's philosophy: appropriate frequency feedback
 */
export async function triggerHaptic(type: HapticType = 'light') {
  try {
    switch (type) {
      case 'light':
        // For high-frequency actions (buttons, taps)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'medium':
        // For moderate-frequency actions (card interactions)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'heavy':
        // For important actions (saves, deletes)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'success':
        // For successful operations
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'warning':
        // For warnings or alerts
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case 'error':
        // For errors
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail on devices that don't support haptics
    console.debug('Haptics not available', error);
  }
}

/**
 * Selection feedback (for selecting items, changing tabs)
 */
export async function selectionFeedback() {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug('Selection feedback not available', error);
  }
}

/**
 * Sequence of haptics for celebrations/achievements
 */
export async function celebrationHaptics() {
  try {
    // Double tap pattern
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 150));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.debug('Celebration haptics not available', error);
  }
}
