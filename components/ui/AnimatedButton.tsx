import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#667eea', '#764ba2'];
      case 'secondary':
        return ['#f093fb', '#f5576c'];
      case 'accent':
        return ['#4facfe', '#00f2fe'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  const getButtonStyle = () => {
    const baseStyle = styles.button;
    switch (size) {
      case 'small':
        return [baseStyle, styles.smallButton];
      case 'large':
        return [baseStyle, styles.largeButton];
      default:
        return [baseStyle, styles.mediumButton];
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      default:
        return 20;
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabled,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={getButtonStyle()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color="white"
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, getTextStyle()]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  largeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});