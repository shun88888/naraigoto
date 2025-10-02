import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function GradientButton({ children, onPress, disabled, style }: Props) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.8} style={style}>
      <LinearGradient
        colors={disabled ? ['#D4D4D4', '#D4D4D4'] : ['#FF4D6D', '#FF8A00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical: 16,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800' }}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}





