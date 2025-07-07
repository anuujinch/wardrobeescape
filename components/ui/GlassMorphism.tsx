import { BlurView } from 'expo-blur';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

interface GlassMorphismProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: any;
  borderRadius?: number;
  backgroundColor?: string;
}

export const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  intensity = 80,
  tint = 'light',
  style,
  borderRadius = 20,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[
          styles.blurView,
          {
            borderRadius,
            backgroundColor,
          },
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blurView: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});