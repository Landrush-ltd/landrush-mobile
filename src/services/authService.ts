import { api } from './api';
import type { User } from '../types/user';

interface AuthResponse {
  user: User;
  token: string;
}

const apiEnabled = !!process.env.EXPO_PUBLIC_API_URL;

export async function loginWithEmail(emailOrPhone: string, password: string): Promise<AuthResponse> {
  if (!apiEnabled) {
    await delay(900);
    return {
      user: mockUser(emailOrPhone),
      token: 'mock-jwt-token',
    };
  }
  const res = await api.post<AuthResponse>('/auth/login', { emailOrPhone, password });
  return res.data;
}

export async function signupWithEmail(
  emailOrPhone: string,
  password: string,
): Promise<{ message: string }> {
  if (!apiEnabled) {
    await delay(900);
    return { message: 'OTP sent' };
  }
  const res = await api.post<{ message: string }>('/auth/signup', { emailOrPhone, password });
  return res.data;
}

export async function verifyOtp(
  emailOrPhone: string,
  otp: string,
): Promise<AuthResponse> {
  if (!apiEnabled) {
    await delay(700);
    return { user: mockUser(emailOrPhone), token: 'mock-jwt-token' };
  }
  const res = await api.post<AuthResponse>('/auth/verify-otp', { emailOrPhone, otp });
  return res.data;
}

export async function loginWithGoogle(
  accessToken: string,
): Promise<AuthResponse> {
  if (!apiEnabled) {
    // Fetch real Google profile to show the correct name/email
    try {
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        return {
          user: {
            id: profile.id,
            firstName: profile.given_name ?? profile.name?.split(' ')[0] ?? 'User',
            lastName: profile.family_name ?? profile.name?.split(' ').slice(1).join(' ') ?? '',
            email: profile.email,
            phone: '',
            avatar: profile.picture ?? '',
            role: 'seeker',
            isVerified: true,
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        };
      }
    } catch {}
    return { user: mockUser('kennethumoekpe@gmail.com'), token: 'mock-jwt-token' };
  }
  const res = await api.post<AuthResponse>('/auth/oauth/google', { accessToken });
  return res.data;
}

export async function loginWithApple(
  identityToken: string,
  email: string | null,
  fullName: { givenName?: string | null; familyName?: string | null } | null,
): Promise<AuthResponse> {
  if (!apiEnabled) {
    await delay(500);
    return {
      user: {
        id: 'apple-user',
        firstName: fullName?.givenName ?? 'Apple',
        lastName: fullName?.familyName ?? 'User',
        email: email ?? '',
        phone: '',
        avatar: '',
        role: 'seeker',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    };
  }
  const res = await api.post<AuthResponse>('/auth/oauth/apple', {
    identityToken,
    email,
    fullName,
  });
  return res.data;
}

// Keep for backward compatibility
export async function loginWithSocial(
  provider: 'google' | 'apple',
  idToken: string,
): Promise<AuthResponse> {
  if (provider === 'google') return loginWithGoogle(idToken);
  return loginWithApple(idToken, null, null);
}

export async function refreshToken(token: string): Promise<{ token: string }> {
  const res = await api.post<{ token: string }>('/auth/refresh', {}, token);
  return res.data;
}

export async function registerPushToken(
  pushToken: string,
  authToken: string,
): Promise<void> {
  if (!apiEnabled) return;
  await api.post('/users/push-token', { pushToken }, authToken);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockUser(emailOrPhone: string): User {
  return {
    id: '1',
    firstName: 'Kenneth',
    lastName: 'Umoekpe',
    email: emailOrPhone.includes('@') ? emailOrPhone : 'kennethumoekpe@gmail.com',
    phone: emailOrPhone.includes('@') ? '' : emailOrPhone,
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: 'seeker',
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
}
