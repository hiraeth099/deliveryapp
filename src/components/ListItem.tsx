import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { lightTheme } from '../theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
  disabled = false,
}) => {
  const theme = lightTheme; // TODO: Use theme context

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        disabled && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {leftIcon && (
        <View style={styles.leftIcon}>
          {leftIcon}
        </View>
      )}
      
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.onSurface },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightIcon && (
        <View style={styles.rightIcon}>
          {rightIcon}
        </View>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    borderBottomWidth: 1,
  },
  leftIcon: {
    marginRight: lightTheme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: lightTheme.typography.body.fontWeight,
    lineHeight: lightTheme.typography.body.lineHeight,
  },
  subtitle: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: lightTheme.typography.bodySmall.fontWeight,
    lineHeight: lightTheme.typography.bodySmall.lineHeight,
    marginTop: lightTheme.spacing.xs,
  },
  rightIcon: {
    marginLeft: lightTheme.spacing.md,
  },
});