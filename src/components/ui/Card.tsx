import React from 'react';
import { View } from 'react-native';
import { colors } from '../../lib/colors';

type Props = {
  children: React.ReactNode;
  style?: any;
  testID?: string;
};

export function UICard({ children, style, testID }: Props) {
  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1
        },
        style
      ]}
    >
      {children}
    </View>
  );
}



