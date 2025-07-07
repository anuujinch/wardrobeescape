import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const FloatingIcon = ({ name, color, size = 40, style }: any) => {
    const [rotateAnim] = useState(new Animated.Value(0));
    
    useEffect(() => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View style={[{ transform: [{ rotate }] }, style]}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Floating Icons Background */}
          <View style={styles.floatingIconsContainer}>
            <FloatingIcon name="shirt" color="rgba(255,255,255,0.1)" size={60} style={styles.floatingIcon1} />
            <FloatingIcon name="diamond" color="rgba(255,255,255,0.1)" size={40} style={styles.floatingIcon2} />
            <FloatingIcon name="sparkles" color="rgba(255,255,255,0.1)" size={50} style={styles.floatingIcon3} />
            <FloatingIcon name="heart" color="rgba(255,255,255,0.1)" size={35} style={styles.floatingIcon4} />
          </View>

          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Wardrobe Escape</Text>
              <Text style={styles.subtitle}>Your Personal AI Style Assistant</Text>
              <View style={styles.tagline}>
                <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.taglineText}>Discover your perfect style</Text>
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              <BlurView intensity={20} tint="light" style={styles.heroCard}>
                <View style={styles.heroContent}>
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={['#4facfe', '#00f2fe']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="shirt" size={80} color="white" />
                    </LinearGradient>
                  </View>
                  
                  <Text style={styles.description}>
                    Take a mirror selfie and let our AI analyze your style, mood, and occasion to suggest the perfect outfit combination.
                  </Text>
                  
                  <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>10K+</Text>
                      <Text style={styles.statLabel}>Outfits</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>95%</Text>
                      <Text style={styles.statLabel}>Accuracy</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>4.9⭐</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/mirror-camera')}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="camera" size={24} color="white" style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Start Mirror Check</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/wardrobe-assessment')}
              >
                <BlurView intensity={30} tint="light" style={styles.secondaryButtonBlur}>
                  <Ionicons name="checkmark-circle" size={24} color="white" style={styles.buttonIcon} />
                  <Text style={styles.secondaryButtonText}>Build My Wardrobe</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Features */}
            <View style={styles.features}>
              <BlurView intensity={20} tint="light" style={styles.featureCard}>
                <View style={styles.feature}>
                  <Ionicons name="sparkles" size={24} color="#f093fb" />
                  <Text style={styles.featureTitle}>AI-Powered</Text>
                  <Text style={styles.featureDescription}>Smart outfit recommendations</Text>
                </View>
              </BlurView>
              
              <BlurView intensity={20} tint="light" style={styles.featureCard}>
                <View style={styles.feature}>
                  <Ionicons name="time" size={24} color="#4facfe" />
                  <Text style={styles.featureTitle}>Quick & Easy</Text>
                  <Text style={styles.featureDescription}>Get styled in seconds</Text>
                </View>
              </BlurView>
              
              <BlurView intensity={20} tint="light" style={styles.featureCard}>
                <View style={styles.feature}>
                  <Ionicons name="trending-up" size={24} color="#667eea" />
                  <Text style={styles.featureTitle}>Trendy</Text>
                  <Text style={styles.featureDescription}>Stay fashion-forward</Text>
                </View>
              </BlurView>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingIconsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  floatingIcon1: {
    position: 'absolute',
    top: '15%',
    right: '10%',
  },
  floatingIcon2: {
    position: 'absolute',
    top: '60%',
    left: '5%',
  },
  floatingIcon3: {
    position: 'absolute',
    top: '30%',
    left: '15%',
  },
  floatingIcon4: {
    position: 'absolute',
    top: '75%',
    right: '20%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  taglineText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    borderRadius: 25,
    padding: 25,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 30,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonBlur: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  feature: {
    alignItems: 'center',
  },
  featureTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
