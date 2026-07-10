# Frontend Integration Guide - Email Verification & Auth

This guide shows how to connect the React Native frontend to the Node.js backend API.

## Step 1: Create API Service

Create a new file: `src/services/api.ts`

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add JWT token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  // Signup
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
  }) => api.post('/auth/signup', data),

  // Verify OTP
  verifyOTP: (userId: string, code: string) =>
    api.post('/auth/verify-otp', { userId, code }),

  // Resend OTP
  resendOTP: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  // Login
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  // Forgot password
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export default api;
```

## Step 2: Install Required Package

```bash
npm install axios
```

## Step 3: Update Authentication Flow

### Update Signup Screen

```typescript
import { authAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/auth';

export default function SignupScreen() {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      const response = await authAPI.signup({
        firstName: 'John',
        lastName: 'Doe',
        email,
        password,
        role: 'buyer',
      });

      // Store token
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userId', response.data.userId);

      // Store user data
      setAuthUser(response.data);

      // Navigate to OTP verification
      router.push('/verify-otp');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your signup form
  );
}
```

### Create OTP Verification Screen

```typescript
import { authAPI } from '../../src/services/api';

export default function VerifyOTPScreen() {
  const [code, setCode] = useState('');
  const userId = await AsyncStorage.getItem('userId');
  const router = useRouter();

  const handleVerifyOTP = async () => {
    try {
      await authAPI.verifyOTP(userId, code);
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleResendOTP = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      await authAPI.resendOTP(email);
      Alert.alert('Success', 'OTP resent to your email');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to your email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        maxLength={6}
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyOTP}
      >
        <Text style={styles.buttonText}>Verify Email</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOTP}>
        <Text style={styles.link}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Update Login Screen

```typescript
import { authAPI } from '../../src/services/api';

export default function LoginScreen() {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      // Store token
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userId', response.data.userId);

      // Store user data
      setAuthUser(response.data);

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your login form
  );
}
```

### Create Password Reset Screen

```typescript
import { authAPI } from '../../src/services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      await authAPI.forgotPassword(email);
      setEmailSent(true);
      Alert.alert('Success', 'Check your email for password reset link');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      
      {!emailSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.message}>
          Password reset link sent to {email}. Check your email!
        </Text>
      )}
    </View>
  );
}
```

## Step 4: Update Auth Store

```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setAuthUser: async (user) => {
    await AsyncStorage.setItem('authToken', user.token);
    set({ user, token: user.token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      set({ token });
    }
  },
}));
```

## Step 5: Update Environment Configuration

Update your API URL based on environment:

```typescript
// src/config/api.ts
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.landrush.com'
    : 'http://localhost:5000/api';
```

## Complete Flow Diagram

```
1. Signup Screen
   ↓ [Send email, password, role]
   ↓ API: POST /auth/signup
   ↓ [Server sends OTP email]
   ↓
2. OTP Verification Screen
   ↓ [User enters 6-digit code]
   ↓ API: POST /auth/verify-otp
   ↓ [Email verified]
   ↓
3. Home Screen (Auto login)
   ↓
   ↓ OR
   ↓
4. Login Screen
   ↓ [Send email, password]
   ↓ API: POST /auth/login
   ↓ [Verify email verified first]
   ↓
5. Home Screen
```

## Testing the Integration

1. **Start backend:**
```bash
cd backend
npm run dev
```

2. **Update API URL** in your app to match backend URL

3. **Test signup flow:**
   - Navigate to signup screen
   - Enter test email (use Mailtrap for testing)
   - Verify OTP is received
   - Complete signup

4. **Test login:**
   - Use verified email to login
   - Should redirect to home

5. **Test password reset:**
   - Forgot password screen
   - Check email for reset link
   - Reset password

## Error Handling

Always handle common errors:

```typescript
try {
  const response = await authAPI.login(email, password);
} catch (error) {
  if (error.message.includes('Invalid credentials')) {
    // Show specific error
  } else if (error.message.includes('verify your email')) {
    // Redirect to OTP verification
  } else {
    // Show generic error
  }
}
```

## Notes

- Store JWT token securely in AsyncStorage
- Always verify token before making API calls
- Implement token refresh for long sessions
- Handle 401 responses by clearing auth state
- Test with real email service or Mailtrap
