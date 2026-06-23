import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, textVariantStyles[variant], textSizeStyles[size], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: {
    fontWeight: Typography.fontWeightSemiBold,
    letterSpacing: 0.2,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.error },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 36 },
  md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 44 },
  lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, minHeight: 52 },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: Colors.white },
  secondary: { color: Colors.white },
  outline: { color: Colors.primary },
  ghost: { color: Colors.primary },
  danger: { color: Colors.white },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: Typography.fontSizeSm },
  md: { fontSize: Typography.fontSizeMd },
  lg: { fontSize: Typography.fontSizeLg },
});
