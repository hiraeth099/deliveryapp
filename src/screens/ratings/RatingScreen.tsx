import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { validateRequired, validateMinLength, validateMaxLength } from '../../utils/validation';
import { ArrowLeft, Star, User, Store } from 'lucide-react-native';

type Props = StackScreenProps<OrdersStackParamList, 'Rating'>;

const RatingScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = lightTheme;
  const { orderId, type } = route.params;
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
    if (error) setError('');
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    const feedbackError = validateRequired(feedback, 'Feedback');
    if (feedbackError) {
      setError(feedbackError);
      return;
    }

    const minLengthError = validateMinLength(feedback, 10, 'Feedback');
    if (minLengthError) {
      setError(minLengthError);
      return;
    }

    const maxLengthError = validateMaxLength(feedback, 500, 'Feedback');
    if (maxLengthError) {
      setError(maxLengthError);
      return;
    }

    setLoading(true);
    try {
      // TODO: integrate backend call here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock API call
      
      Alert.alert(
        'Thank You!',
        'Your rating has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return type === 'customer' ? 'Rate Customer' : 'Rate Restaurant';
  };

  const getDescription = () => {
    return type === 'customer' 
      ? 'How was your experience with the customer?'
      : 'How was your experience with the restaurant?';
  };

  const getIcon = () => {
    return type === 'customer' ? (
      <User color={theme.colors.primary} size={32} />
    ) : (
      <Store color={theme.colors.primary} size={32} />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {getTitle()}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Rating Header */}
        <Card style={styles.headerCard}>
          <View style={styles.ratingHeader}>
            {getIcon()}
            <Text style={[styles.ratingTitle, { color: theme.colors.onSurface }]}>
              {getTitle()}
            </Text>
            <Text style={[styles.ratingDescription, { color: theme.colors.onSurfaceVariant }]}>
              {getDescription()}
            </Text>
          </View>
        </Card>

        {/* Star Rating */}
        <Card style={styles.ratingCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Your Rating
          </Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => handleRatingPress(star)}
              >
                <Star
                  size={40}
                  color={star <= rating ? theme.colors.warning : theme.colors.border}
                  fill={star <= rating ? theme.colors.warning : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: theme.colors.onSurface }]}>
              {ratingLabels[rating as keyof typeof ratingLabels]}
            </Text>
          )}
        </Card>

        {/* Feedback */}
        <Card style={styles.feedbackCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Feedback (Optional)
          </Text>
          
          <TextInput
            style={[
              styles.feedbackInput,
              {
                borderColor: error ? theme.colors.error : theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
              },
            ]}
            value={feedback}
            onChangeText={(text) => {
              setFeedback(text);
              if (error) setError('');
            }}
            placeholder={`Share your experience with the ${type}...`}
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          
          <View style={styles.feedbackMeta}>
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}
            <Text style={[styles.characterCount, { color: theme.colors.onSurfaceVariant }]}>
              {feedback.length}/500
            </Text>
          </View>
        </Card>

        {/* Quick Feedback Options */}
        {rating > 0 && (
          <Card style={styles.quickFeedbackCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Quick Feedback
            </Text>
            
            <View style={styles.quickOptions}>
              {type === 'customer' ? (
                <>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setFeedback('Customer was polite and cooperative')}
                  >
                    <Text style={[styles.quickOptionText, { color: theme.colors.onSurface }]}>
                      Polite & Cooperative
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setFeedback('Easy to find the delivery location')}
                  >
                    <Text style={[styles.quickOptionText, { color: theme.colors.onSurface }]}>
                      Easy to Find
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setFeedback('Customer was available on time')}
                  >
                    <Text style={[styles.quickOptionText, { color: theme.colors.onSurface }]}>
                      Available on Time
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setFeedback('Order was ready on time')}
                  >
                    <Text style={[styles.quickOptionText, { color: theme.colors.onSurface }]}>
                      Ready on Time
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setFeedback('Staff was helpful and friendly')}
                  >
                    <Text style={[styles.quickOptionText, { color: theme.colors.onSurface }]}>
                      Helpful Staff
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickOption}
                    onPress={() => setFeedback('Food was well packaged')}
                  >
                    <Text style={[styles.quickOptionText, { color: theme.colors.onSurface }]}>
                      Well Packaged
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          title="Submit Rating"
          onPress={handleSubmitRating}
          loading={loading}
          disabled={rating === 0}
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
  headerCard: {
    marginBottom: lightTheme.spacing.md,
    alignItems: 'center',
  },
  ratingHeader: {
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm,
  },
  ratingDescription: {
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
  },
  ratingCard: {
    marginBottom: lightTheme.spacing.md,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.lg,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.md,
  },
  starButton: {
    padding: lightTheme.spacing.xs,
  },
  ratingLabel: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: '500',
  },
  feedbackCard: {
    marginBottom: lightTheme.spacing.md,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body.fontSize,
    minHeight: 100,
  },
  feedbackMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: lightTheme.spacing.sm,
  },
  errorText: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  characterCount: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  quickFeedbackCard: {
    marginBottom: lightTheme.spacing.md,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: lightTheme.spacing.sm,
  },
  quickOption: {
    backgroundColor: lightTheme.colors.surfaceVariant,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.full,
  },
  quickOptionText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  submitButton: {
    marginBottom: lightTheme.spacing.xl,
  },
});

export default RatingScreen;