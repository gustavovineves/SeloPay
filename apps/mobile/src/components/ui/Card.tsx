import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../theme';

interface CardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

export function Card({ children, style, padding = 'md', elevated = false, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && Shadows.md,
        padding !== 'none' && paddingStyles[padding],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});

const paddingStyles = StyleSheet.create({
  sm: { padding: Spacing.md },
  md: { padding: Spacing.lg },
  lg: { padding: Spacing.xxl },
});
