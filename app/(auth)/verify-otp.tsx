import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (code: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setUser(
        {
          id: '1',
          firstName: 'Kenneth',
          lastName: 'Umoekpe',
          email: 'kennethumoekpe@gmail.com',
          phone: phone || '+234...',
          avatar: 'https://i.pravatar.cc/150?img=11',
          role: 'seeker',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        'mock-jwt-token',
      );
      router.replace('/(tabs)');
    }, 1500);
  };

  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(60);
      Alert.alert('Code Resent', 'A new verification code has been sent.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Verify your account</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{'\n'}
        <Text style={styles.phoneText}>{phone || 'your phone'}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {isVerifying && (
        <Text style={styles.verifyingText}>Verifying...</Text>
      )}

      <View style={styles.resendContainer}>
        <Text style={styles.resendLabel}>Didn't receive the code?</Text>
        <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
          <Text
            style={[styles.resendButton, countdown > 0 && styles.resendDisabled]}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDDF',
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
  },
  phoneText: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  verifyingText: {
    textAlign: 'center',
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  resendContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resendLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  resendButton: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textTertiary,
  },
});
