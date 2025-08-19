import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { lightTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof lightTheme.spacing;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = true,
}) => {
  const theme = lightTheme; // TODO: Use theme context

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          padding: theme.spacing[padding],
          borderColor: theme.colors.border,
        },
        shadow && theme.shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: lightTheme.borderRadius.lg,
    borderWidth: 1,
  },
});