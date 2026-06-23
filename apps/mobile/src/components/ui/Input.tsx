import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, error, hint, leftIcon, secureTextEntry, style, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          !!error && styles.hasError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={isFocused ? Colors.primary : Colors.textLight}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={isPassword && !isVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },
  label: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  focused: { borderColor: Colors.primary, backgroundColor: '#FAFCFF' },
  hasError: { borderColor: Colors.error },
  leftIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: Typography.fontSizeMd,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  error: {
    fontSize: Typography.fontSizeXs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
