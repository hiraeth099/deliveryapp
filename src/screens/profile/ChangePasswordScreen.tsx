import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { validateRequired, validatePassword } from '../../utils/validation';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react-native';

type Props = StackScreenProps<ProfileStackParamList, 'ChangePassword'>;

const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = lightTheme;
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const currentPasswordError = validateRequired(formData.currentPassword, 'Current password');
    if (currentPasswordError) newErrors.currentPassword = currentPasswordError;

    const newPasswordError = validateRequired(formData.newPassword, 'New password');
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.errors[0];
      }
    }

    const confirmPasswordError = validateRequired(formData.confirmPassword, 'Confirm password');
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: integrate backend call here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock API call
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Change Password
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Lock color={theme.colors.primary} size={24} />
            <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
              Password Security
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            Choose a strong password to keep your account secure. Your password should be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
          </Text>
        </Card>

        {/* Password Form */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Update Password
          </Text>
          
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Current Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    borderColor: errors.currentPassword ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={formData.currentPassword}
                onChangeText={(text) => handleInputChange('currentPassword', text)}
                placeholder="Enter your current password"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry={!showPasswords.current}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff color={theme.colors.onSurfaceVariant} size={20} />
                ) : (
                  <Eye color={theme.colors.onSurfaceVariant} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.currentPassword}
              </Text>
            )}
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              New Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    borderColor: errors.newPassword ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={formData.newPassword}
                onChangeText={(text) => handleInputChange('newPassword', text)}
                placeholder="Enter your new password"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry={!showPasswords.new}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff color={theme.colors.onSurfaceVariant} size={20} />
                ) : (
                  <Eye color={theme.colors.onSurfaceVariant} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.newPassword}
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Confirm New Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                placeholder="Confirm your new password"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry={!showPasswords.confirm}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff color={theme.colors.onSurfaceVariant} size={20} />
                ) : (
                  <Eye color={theme.colors.onSurfaceVariant} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>
        </Card>

        {/* Password Requirements */}
        <Card style={styles.requirementsCard}>
          <Text style={[styles.requirementsTitle, { color: theme.colors.onSurface }]}>
            Password Requirements
          </Text>
          <View style={styles.requirementsList}>
            <Text style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
              • At least 8 characters long
            </Text>
            <Text style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
              • Contains uppercase letter (A-Z)
            </Text>
            <Text style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
              • Contains lowercase letter (a-z)
            </Text>
            <Text style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
              • Contains at least one number (0-9)
            </Text>
          </View>
        </Card>

        {/* Change Password Button */}
        <Button
          title="Change Password"
          onPress={handleChangePassword}
          loading={loading}
          style={styles.changeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  backButton: {
    padding: lightTheme.spacing.sm,
  },
  title: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  infoCard: {
    marginBottom: lightTheme.spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.md,
  },
  infoTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  infoText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: lightTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.lg,
  },
  inputContainer: {
    marginBottom: lightTheme.spacing.lg,
  },
  label: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.sm,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    paddingRight: 50,
    fontSize: lightTheme.typography.body.fontSize,
  },
  eyeButton: {
    position: 'absolute',
    right: lightTheme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  errorText: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  requirementsCard: {
    marginBottom: lightTheme.spacing.md,
  },
  requirementsTitle: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.md,
  },
  requirementsList: {
    gap: lightTheme.spacing.sm,
  },
  requirement: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  changeButton: {
    marginBottom: lightTheme.spacing.xl,
  },
});

export default ChangePasswordScreen;