import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { lightTheme } from '../theme';

interface SnackbarProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const { width } = Dimensions.get('window');

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  visible,
  onDismiss,
  duration = 3000,
  type = 'info',
}) => {
  const theme = lightTheme; // TODO: Use theme context
  const translateY = new Animated.Value(100);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      const timer = setTimeout(() => {
        hideSnackbar();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideSnackbar = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
        },
        theme.shadows.lg,
      ]}
    >
      <Text style={[styles.message, { color: '#FFFFFF' }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: lightTheme.spacing.md,
    right: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    zIndex: 1000,
  },
  message: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: lightTheme.typography.body.fontWeight,
    textAlign: 'center',
  },
});