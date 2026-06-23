import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

export interface AppleUser {
  userId: string;
  email: string | null;
  fullName: AppleAuthentication.AppleAuthenticationFullName | null;
  identityToken: string | null;
}

export function isAppleAuthAvailable(): boolean {
  return Platform.OS === 'ios';
}

export async function checkAppleAuthAvailable(): Promise<boolean> {
  if (!isAppleAuthAvailable()) return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<AppleUser> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  return {
    userId:        credential.user,
    email:         credential.email,
    fullName:      credential.fullName,
    identityToken: credential.identityToken,
  };
}
