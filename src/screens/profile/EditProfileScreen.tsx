import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { updateUserProfile } from '../../store/slices/authSlice';
import { validateRequired, validateEmail, validatePhone } from '../../utils/validation';
import { ArrowLeft, User, Camera } from 'lucide-react-native';

type Props = StackScreenProps<ProfileStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicleType: user?.vehicleType || 'bike' as 'bike' | 'scooter' | 'car',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const vehicleTypes = [
    { key: 'bike', label: 'Bike' },
    { key: 'scooter', label: 'Scooter' },
    { key: 'car', label: 'Car' },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const nameError = validateRequired(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) newErrors.email = emailError;
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';

    const phoneError = validateRequired(formData.phone, 'Phone');
    if (phoneError) newErrors.phone = phoneError;
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await dispatch(updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        vehicleType: formData.vehicleType,
      })).unwrap();
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Edit Profile
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture */}
        <Card style={styles.avatarCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <User color="#FFFFFF" size={32} />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Camera color={theme.colors.primary} size={16} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.avatarText, { color: theme.colors.onSurfaceVariant }]}>
              Tap to change profile picture
            </Text>
          </View>
        </Card>

        {/* Personal Information */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Personal Information
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: errors.name ? theme.colors.error : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                },
              ]}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.placeholder}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.name}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: errors.email ? theme.colors.error : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                },
              ]}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.email}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: errors.phone ? theme.colors.error : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                },
              ]}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.phone}
              </Text>
            )}
          </View>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Vehicle Information
          </Text>
          
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Vehicle Type
          </Text>
          <View style={styles.vehicleOptions}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.key}
                style={[
                  styles.vehicleOption,
                  {
                    borderColor: formData.vehicleType === vehicle.key 
                      ? theme.colors.primary 
                      : theme.colors.border,
                    backgroundColor: formData.vehicleType === vehicle.key 
                      ? theme.colors.primary + '10' 
                      : theme.colors.surface,
                  },
                ]}
                onPress={() => handleInputChange('vehicleType', vehicle.key)}
              >
                <Text style={[
                  styles.vehicleOptionText,
                  { 
                    color: formData.vehicleType === vehicle.key 
                      ? theme.colors.primary 
                      : theme.colors.onSurface 
                  }
                ]}>
                  {vehicle.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Save Button */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
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
  avatarCard: {
    marginBottom: lightTheme.spacing.md,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: lightTheme.spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: lightTheme.colors.background,
  },
  avatarText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
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
  vehicleOptions: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
    marginTop: lightTheme.spacing.sm,
  },
  vehicleOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.md,
    alignItems: 'center',
  },
  vehicleOptionText: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  saveButton: {
    marginBottom: lightTheme.spacing.xl,
  },
});

export default EditProfileScreen;