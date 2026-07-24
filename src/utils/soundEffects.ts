import { Audio } from 'expo-av';

export type SoundType = 'tap' | 'success' | 'error' | 'achievement' | 'share' | 'pop';

interface Sound {
  sound: Audio.Sound;
  isLoading: boolean;
}

const sounds: Map<SoundType, Sound> = new Map();

/**
 * Initialize sound effects
 * Call once on app startup
 */
export async function initializeSounds() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.debug('Audio initialization failed:', error);
  }
}

/**
 * Preload a sound effect
 * Call during app initialization or before usage
 */
export async function preloadSound(type: SoundType, uri: string) {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    sounds.set(type, { sound, isLoading: false });
  } catch (error) {
    console.debug(`Failed to preload sound ${type}:`, error);
  }
}

/**
 * Play a sound effect
 * Silently fails on unsupported devices
 */
export async function playSound(type: SoundType) {
  try {
    const soundData = sounds.get(type);
    if (!soundData) {
      console.debug(`Sound ${type} not loaded`);
      return;
    }

    const { sound } = soundData;
    await sound.setPositionAsync(0); // Reset to start
    await sound.playAsync();
  } catch (error) {
    console.debug(`Failed to play sound ${type}:`, error);
  }
}

/**
 * Predefined sound sequences for common actions
 * Use these instead of playing individual sounds
 */

export async function playTapSound() {
  // Short, light click - for button presses
  await playSound('tap');
}

export async function playSuccessSound() {
  // Ascending tone - for successful actions
  await playSound('success');
}

export async function playErrorSound() {
  // Warning tone - for errors
  await playSound('error');
}

export async function playAchievementSound() {
  // Celebratory jingle - for milestones
  await playSound('achievement');
}

export async function playShareSound() {
  // Uplifting sound - for sharing
  await playSound('share');
}

export async function playPopSound() {
  // Fun pop - for delightful moments
  await playSound('pop');
}

/**
 * Clean up sounds on app exit
 */
export async function cleanupSounds() {
  try {
    for (const soundData of sounds.values()) {
      await soundData.sound.unloadAsync();
    }
    sounds.clear();
  } catch (error) {
    console.debug('Failed to cleanup sounds:', error);
  }
}

/**
 * Check if sounds are available on device
 */
export function areSoundsAvailable(): boolean {
  return sounds.size > 0;
}
