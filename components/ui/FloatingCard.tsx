import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Animated, StyleSheet } from 'react-native';

interface FloatingCardProps {
  children: React.ReactNode;
  style?: any;
  gradient?: string[];
  shadowColor?: string;
  elevation?: number;
  borderRadius?: number;
  padding?: number;
  animated?: boolean;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  style,
  gradient = ['#ffffff', '#f8f9fa'],
  shadowColor = '#000',
  elevation = 8,
  borderRadius = 20,
  padding = 20,
  animated = true,
}) => {
  const scaleAnim = new Animated.Value(1);
  const translateYAnim = new Animated.Value(0);

  React.useEffect(() => {
    if (animated) {
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );

      const floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(translateYAnim, {
            toValue: -5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      breathingAnimation.start();
      floatingAnimation.start();

      return () => {
        breathingAnimation.stop();
        floatingAnimation.stop();
      };
    }
  }, [animated]);

  return (
    <Animated.View
      style={[
        {
          transform: animated 
            ? [{ scale: scaleAnim }, { translateY: translateYAnim }]
            : [],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={gradient}
        style={[
          styles.card,
          {
            shadowColor,
            shadowOffset: {
              width: 0,
              height: elevation / 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: elevation,
            elevation,
            borderRadius,
            padding,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
});