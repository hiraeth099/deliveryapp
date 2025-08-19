import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { lightTheme } from '../../theme';
import { loginWithOTP } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { validateOTP } from '../../utils/validation';
import { authAPI } from '../../utils/api';

type Props = StackScreenProps<AuthStackParamList, 'OTP'>;

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  const { phone } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (!validateOTP(otpString)) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await dispatch(loginWithOTP({ phone, otp: otpString })).unwrap();
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await authAPI.sendOTP(phone);
      if (response.success) {
        setCountdown(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Verify OTP
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            We've sent a 6-digit code to{'\n'}
            <Text style={{ fontWeight: '600' }}>+91 {phone}</Text>
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={otp.some(digit => !digit)}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={resendLoading}>
                <Text style={[styles.resendText, { color: theme.colors.primary }]}>
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.countdownText, { color: theme.colors.onSurfaceVariant }]}>
                Resend OTP in {countdown}s
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.changeNumberButton}
          >
            <Text style={[styles.changeNumberText, { color: theme.colors.onSurfaceVariant }]}>
              Change Phone Number
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xxl,
  },
  title: {
    fontSize: lightTheme.typography.h1.fontSize,
    fontWeight: lightTheme.typography.h1.fontWeight,
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    padding: lightTheme.spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: lightTheme.spacing.xl,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderRadius: lightTheme.borderRadius.md,
    fontSize: 20,
    fontWeight: '600',
  },
  verifyButton: {
    marginBottom: lightTheme.spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  resendText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  countdownText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  changeNumberButton: {
    alignItems: 'center',
  },
  changeNumberText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
});

export default OTPScreen;