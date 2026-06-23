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

export async function loginWithSocial(
  provider: 'google' | 'apple',
  idToken: string,
): Promise<AuthResponse> {
  if (!apiEnabled) {
    await delay(1000);
    return { user: mockUser('kennethumoekpe@gmail.com'), token: 'mock-jwt-token' };
  }
  const res = await api.post<AuthResponse>(`/auth/oauth/${provider}`, { idToken });
  return res.data;
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
