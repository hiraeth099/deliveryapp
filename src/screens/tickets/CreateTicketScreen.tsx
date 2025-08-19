import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { TicketsStackParamList } from '../../navigation/TicketsNavigator';
import { AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { createTicket } from '../../store/slices/ticketsSlice';
import { validateRequired, validateMinLength, validateMaxLength } from '../../utils/validation';
import { ArrowLeft, Camera, CircleAlert as AlertCircle, Package, CreditCard, Smartphone } from 'lucide-react-native';

type Props = StackScreenProps<TicketsStackParamList, 'CreateTicket'>;

const CreateTicketScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as 'order_issue' | 'payment' | 'technical' | 'other',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const categories = [
    { key: 'order_issue', label: 'Order Issue', icon: Package, description: 'Problems with orders, delivery, or restaurants' },
    { key: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment issues, earnings, or wallet problems' },
    { key: 'technical', label: 'Technical', icon: Smartphone, description: 'App bugs, crashes, or technical difficulties' },
    { key: 'other', label: 'Other', icon: AlertCircle, description: 'General inquiries or other issues' },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const titleError = validateRequired(formData.title, 'Title');
    if (titleError) newErrors.title = titleError;
    else {
      const titleLengthError = validateMinLength(formData.title, 5, 'Title');
      if (titleLengthError) newErrors.title = titleLengthError;
      else {
        const titleMaxError = validateMaxLength(formData.title, 100, 'Title');
        if (titleMaxError) newErrors.title = titleMaxError;
      }
    }

    const descriptionError = validateRequired(formData.description, 'Description');
    if (descriptionError) newErrors.description = descriptionError;
    else {
      const descLengthError = validateMinLength(formData.description, 20, 'Description');
      if (descLengthError) newErrors.description = descLengthError;
      else {
        const descMaxError = validateMaxLength(formData.description, 1000, 'Description');
        if (descMaxError) newErrors.description = descMaxError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await dispatch(createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
      })).unwrap();
      
      Alert.alert(
        'Success',
        'Your support ticket has been created successfully. Our team will respond soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create ticket');
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
          Create Support Ticket
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Category Selection */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Select Category
          </Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryCard,
                    {
                      borderColor: formData.category === category.key 
                        ? theme.colors.primary 
                        : theme.colors.border,
                      backgroundColor: formData.category === category.key 
                        ? theme.colors.primary + '10' 
                        : theme.colors.surface,
                    },
                  ]}
                  onPress={() => handleInputChange('category', category.key)}
                >
                  <IconComponent 
                    color={formData.category === category.key 
                      ? theme.colors.primary 
                      : theme.colors.onSurfaceVariant
                    } 
                    size={24} 
                  />
                  <Text style={[
                    styles.categoryLabel,
                    { 
                      color: formData.category === category.key 
                        ? theme.colors.primary 
                        : theme.colors.onSurface 
                    }
                  ]}>
                    {category.label}
                  </Text>
                  <Text style={[styles.categoryDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {category.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Title Input */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Issue Title
          </Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                borderColor: errors.title ? theme.colors.error : theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
              },
            ]}
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="Brief description of your issue"
            placeholderTextColor={theme.colors.placeholder}
            maxLength={100}
          />
          {errors.title && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.title}
            </Text>
          )}
          <Text style={[styles.characterCount, { color: theme.colors.onSurfaceVariant }]}>
            {formData.title.length}/100
          </Text>
        </Card>

        {/* Description Input */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Detailed Description
          </Text>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                borderColor: errors.description ? theme.colors.error : theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
              },
            ]}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Please provide detailed information about your issue. Include steps to reproduce the problem, error messages, or any other relevant details."
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          {errors.description && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.description}
            </Text>
          )}
          <Text style={[styles.characterCount, { color: theme.colors.onSurfaceVariant }]}>
            {formData.description.length}/1000
          </Text>
        </Card>

        {/* Attachments */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Attachments (Optional)
          </Text>
          <TouchableOpacity style={styles.attachmentButton}>
            <Camera color={theme.colors.onSurfaceVariant} size={24} />
            <Text style={[styles.attachmentText, { color: theme.colors.onSurfaceVariant }]}>
              Add screenshots or photos
            </Text>
          </TouchableOpacity>
          <Text style={[styles.attachmentNote, { color: theme.colors.onSurfaceVariant }]}>
            Screenshots can help us understand your issue better
          </Text>
        </Card>

        {/* Submit Button */}
        <Button
          title="Create Ticket"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
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
  sectionCard: {
    marginBottom: lightTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  categoriesGrid: {
    gap: lightTheme.spacing.sm,
  },
  categoryCard: {
    borderWidth: 2,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
    marginTop: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.xs,
  },
  categoryDescription: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    textAlign: 'center',
    lineHeight: 18,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body.fontSize,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body.fontSize,
    minHeight: 120,
  },
  errorText: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  characterCount: {
    fontSize: lightTheme.typography.caption.fontSize,
    textAlign: 'right',
    marginTop: lightTheme.spacing.xs,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: lightTheme.spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: lightTheme.colors.border,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.xl,
    marginBottom: lightTheme.spacing.sm,
  },
  attachmentText: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  attachmentNote: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    textAlign: 'center',
  },
  submitButton: {
    marginBottom: lightTheme.spacing.xl,
  },
});

export default CreateTicketScreen;