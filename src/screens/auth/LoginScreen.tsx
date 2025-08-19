import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Alert,
  TouchableOpacity, StatusBar, TextInput
} from 'react-native';
import { useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { lightTheme } from '../../theme';
import { AppDispatch } from '../../store';

import { getStaffValidation } from '@/src/utils/getapi';
import { setAuthenticated } from '../../store/slices/authSlice';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;

  const [stage, setStage] = useState<'send' | 'verify'>('send');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [actualOtp, setActualOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (stage === 'verify' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [stage, countdown]);

  const sendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid', 'Enter a valid phone number.');
      return;
    }

    // Add country code if not present
    const full = phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber;
    
    setLoading(true);
    try {
      const data = await getStaffValidation(full);
      setActualOtp(data.mobileotp);
      setFullPhone(full);
      setStage('verify');
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '']);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const arr = [...otpDigits];
    arr[idx] = val;
    setOtpDigits(arr);
    if (val && idx < 3) inputRefs.current[idx + 1]?.focus();
  };

  const verifyOtp = async () => {
    const entered = otpDigits.join('');
    if (entered.length !== 4) {
      Alert.alert('Invalid OTP', 'Enter the 4‑digit code');
      return;
    }
    setLoading(true);
    try {
      if (entered !== actualOtp) throw new Error('Wrong OTP');
      
      // Simple auth state update - let AppNavigator handle navigation
      dispatch(setAuthenticated({
        isAuthenticated: true,
        user: { phone: fullPhone }, // Basic user data
      }));
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    try {
      await sendOtp();
      Alert.alert('Success', 'OTP resent');
    } catch {
      // already handled
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {stage === 'send' ? 'Enter Phone Number' : `Verify OTP: ${actualOtp}`}
        </Text>

        <Card style={styles.card}>
          {stage === 'send' ? (
            <>
              <View style={styles.phoneInputContainer}>
                <View style={[styles.countryCodeContainer, { 
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface 
                }]}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={[styles.countryCode, { color: theme.colors.onSurface }]}>+91</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { 
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface
                  }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                />
              </View>
              <Button
                title="Send OTP"
                onPress={sendOtp}
                loading={loading}
                style={styles.button}
              />
            </>
          ) : (
            <>
              <View style={styles.otpContainer}>
                {otpDigits.map((d, i) => (
                  <TextInput
                    key={i}
                    ref={ref => {
                      if (ref) inputRefs.current[i] = ref;
                    }}
                    style={[styles.otpInput, {
                      borderColor: d ? theme.colors.primary : theme.colors.border
                    }]}
                    value={d}
                    onChangeText={v => handleOtpChange(v, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
              <Button
                title="Verify OTP"
                onPress={verifyOtp}
                loading={loading}
                disabled={otpDigits.some(x => !x)}
                style={styles.button}
              />

              <View style={styles.resendSection}>
                {canResend ? (
                  <TouchableOpacity onPress={resendOtp} disabled={resendLoading}>
                    <Text style={[styles.resendText, { color: theme.colors.primary }]}>
                      {resendLoading ? 'Resending...' : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.countdownText, { color: theme.colors.onSurfaceVariant }]}>
                    Resend in {countdown}s
                  </Text>
                )}
              </View>

              <TouchableOpacity onPress={() => setStage('send')}>
                <Text style={[styles.changeText, { color: theme.colors.onSurfaceVariant }]}>
                  Change Phone Number
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: lightTheme.spacing.lg
  },
  title: {
    fontSize: lightTheme.typography.h1.fontSize,
    fontWeight: lightTheme.typography.h1.fontWeight,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.xl
  },
  card: {
    padding: lightTheme.spacing.lg
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: lightTheme.spacing.md,
    height: 56
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderTopLeftRadius: lightTheme.borderRadius.md,
    borderBottomLeftRadius: lightTheme.borderRadius.md,
    borderRightWidth: 0,
    minWidth: 80,
    justifyContent: 'center'
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 4
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600'
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderTopRightRadius: lightTheme.borderRadius.md,
    borderBottomRightRadius: lightTheme.borderRadius.md,
    borderLeftWidth: 0,
    paddingHorizontal: lightTheme.spacing.md,
    fontSize: 16
  },
  button: {
    marginTop: lightTheme.spacing.md
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: lightTheme.spacing.lg
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    fontSize: 18,
    fontWeight: '600'
  },
  resendSection: {
    alignItems: 'center',
    marginVertical: lightTheme.spacing.md
  },
  resendText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500'
  },
  countdownText: {
    fontSize: lightTheme.typography.bodySmall.fontSize
  },
  changeText: {
    textAlign: 'center',
    fontSize: lightTheme.typography.bodySmall.fontSize
  }
});

export default LoginScreen;
