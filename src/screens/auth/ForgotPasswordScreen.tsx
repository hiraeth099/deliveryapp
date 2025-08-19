import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { lightTheme } from '../../theme';
import { validateEmail, validateRequired } from '../../utils/validation';
import { authAPI } from '../../utils/api';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = lightTheme;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetLink = async () => {
    const emailError = validateRequired(email, 'Email');
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        setSent(true);
      } else {
        setError(response.error || 'Failed to send reset link');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            {sent ? 'Check Your Email' : 'Forgot Password?'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {sent 
              ? `We've sent a password reset link to ${email}`
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </Text>
        </View>

        {!sent ? (
          <Card style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: error ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              )}
            </View>

            <Button
              title="Send Reset Link"
              onPress={handleSendResetLink}
              loading={loading}
              style={styles.sendButton}
            />
          </Card>
        ) : (
          <Card style={styles.successCard}>
            <View style={styles.successContent}>
              <Text style={[styles.successText, { color: theme.colors.success }]}>
                ✓ Reset link sent!
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                Click the link in your email to reset your password. If you don't see it, check your spam folder.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => navigation.navigate('Login')}
                style={styles.backToLoginButton}
              />
            </View>
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xxl,
  },
  title: {
    fontSize: lightTheme.typography.h1.fontSize,
    fontWeight: lightTheme.typography.h1.fontWeight,
    marginBottom: lightTheme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    padding: lightTheme.spacing.lg,
  },
  inputContainer: {
    marginBottom: lightTheme.spacing.lg,
  },
  label: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body.fontSize,
  },
  errorText: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  sendButton: {
    marginTop: lightTheme.spacing.md,
  },
  successCard: {
    padding: lightTheme.spacing.lg,
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  instructionText: {
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: lightTheme.spacing.xl,
  },
  backToLoginButton: {
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;