import React from 'react';
import { Pressable, Text } from '@gluestack-ui/themed';
import { ActivityIndicator } from 'react-native';
import { colors } from '../../lib/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type Props = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
  testID?: string;
};

const getStyles = (variant: ButtonVariant, disabled?: boolean) => {
  const base = {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row' as const,
    gap: 8
  };

  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: disabled ? '#222' : colors.fg,
      borderColor: colors.fg
    };
  }
  if (variant === 'secondary') {
    return {
      ...base,
      backgroundColor: disabled ? '#F2E088' : colors.accent,
      borderColor: colors.accent
    };
  }
  return {
    ...base,
    backgroundColor: 'transparent',
    borderColor: colors.border
  };
};

const getTextColor = (variant: ButtonVariant) => {
  if (variant === 'primary') return colors.accent;
  if (variant === 'secondary') return colors.fg;
  return colors.fg;
};

export function UIButton({
  children,
  variant = 'primary',
  onPress,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  testID
}: Props) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      style={[getStyles(variant, disabled), style]}
      android_ripple={{ color: colors.border }}
      accessibilityRole="button"
    >
      {leftIcon}
      {loading ? (
        <ActivityIndicator color={getTextColor(variant)} />
      ) : (
        <Text style={{ color: getTextColor(variant), fontWeight: '700' }}>{children}</Text>
      )}
      {rightIcon}
    </Pressable>
  );
}



