import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Wardrobe Escape</Text>
            <Text style={styles.subtitle}>Your AI Style Assistant</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="shirt" size={80} color="white" />
            </View>
            
            <Text style={styles.description}>
              Let's find the perfect outfit for you! Start by taking a mirror selfie and we'll help you choose the best look for any occasion.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/mirror-camera')}
            >
              <Ionicons name="camera" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Start Mirror Check</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/wardrobe-assessment')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#667eea" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Skip to Wardrobe</Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.featureText}>AI-Powered</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="time" size={20} color="white" />
              <Text style={styles.featureText}>Quick & Easy</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={20} color="white" />
              <Text style={styles.featureText}>Trendy Outfits</Text>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
