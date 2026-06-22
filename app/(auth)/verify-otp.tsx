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
    if (text && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
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

  const filled = otp.filter(Boolean).length;

  return (
    <View style={styles.root}>
      {/* Dark header */}
      <View style={styles.header}>
        <View style={styles.decoCircleLarge} />
        <View style={styles.decoCircleSmall} />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="phone-portrait-outline" size={28} color={Colors.lime} />
        </View>

        <Text style={styles.headerTitle}>Verify your number</Text>
        <Text style={styles.headerSub}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{phone || 'your phone'}</Text>
        </Text>
      </View>

      {/* White card */}
      <View style={styles.card}>
        {/* OTP inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpCell,
                digit ? styles.otpCellFilled : null,
                isVerifying ? styles.otpCellVerifying : null,
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(filled / OTP_LENGTH) * 100}%` },
            ]}
          />
        </View>

        {isVerifying ? (
          <View style={styles.verifyingRow}>
            <Ionicons name="sync-outline" size={16} color={Colors.primary} />
            <Text style={styles.verifyingText}>Verifying code…</Text>
          </View>
        ) : (
          <View style={{ height: 28 }} />
        )}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            filled < OTP_LENGTH && styles.primaryBtnDisabled,
          ]}
          onPress={() => handleVerify(otp.join(''))}
          disabled={filled < OTP_LENGTH || isVerifying}
        >
          <Text style={styles.primaryBtnText}>
            {isVerifying ? 'Verifying…' : 'Confirm Code'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive it?</Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text style={[styles.resendBtn, countdown > 0 && styles.resendDisabled]}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  decoCircleLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
    top: -50,
    right: -50,
  },
  decoCircleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'transparent',
    bottom: 20,
    right: 60,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(159,187,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.display,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: 4,
  },
  phoneHighlight: {
    color: Colors.lime,
    fontWeight: '700',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: 48,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpCell: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    textAlign: 'center',
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  otpCellFilled: {
    borderColor: Colors.lime,
    backgroundColor: `${Colors.lime}14`,
    color: Colors.primary,
  },
  otpCellVerifying: {
    opacity: 0.6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.lime,
    borderRadius: 2,
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 28,
    marginBottom: Spacing.md,
  },
  verifyingText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: Colors.lime,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resendLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  resendBtn: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
