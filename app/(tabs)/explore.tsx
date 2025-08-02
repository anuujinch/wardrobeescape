import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

interface TrendItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

interface StyleCollection {
  id: string;
  name: string;
  items: number;
  color: string;
  icon: string;
  description: string;
}

const FASHION_TRENDS: TrendItem[] = [
  {
    id: '1',
    title: 'Oversized Blazers',
    description: 'Power dressing meets comfort',
    icon: 'business-outline',
    color: '#667eea',
    category: 'Professional',
  },
  {
    id: '2',
    title: 'Earth Tones',
    description: 'Natural color palettes',
    icon: 'leaf-outline',
    color: '#8B7355',
    category: 'Casual',
  },
  {
    id: '3',
    title: 'Statement Accessories',
    description: 'Bold jewelry and bags',
    icon: 'diamond-outline',
    color: '#f093fb',
    category: 'Accessories',
  },
  {
    id: '4',
    title: 'Minimalist Chic',
    description: 'Less is more approach',
    icon: 'remove-circle-outline',
    color: '#4facfe',
    category: 'Elegant',
  },
];

const STYLE_COLLECTIONS: StyleCollection[] = [
  {
    id: '1',
    name: 'Work & Professional',
    items: 24,
    color: '#667eea',
    icon: 'briefcase-outline',
    description: 'Sophisticated looks for the office',
  },
  {
    id: '2',
    name: 'Weekend Casual',
    items: 18,
    color: '#764ba2',
    icon: 'cafe-outline',
    description: 'Comfortable yet stylish',
  },
  {
    id: '3',
    name: 'Date Night',
    items: 15,
    color: '#f093fb',
    icon: 'heart-outline',
    description: 'Romantic and elegant',
  },
  {
    id: '4',
    name: 'Summer Vibes',
    items: 21,
    color: '#f5576c',
    icon: 'sunny-outline',
    description: 'Light and breezy',
  },
];

const COLOR_PALETTES = [
  { name: 'Neutral Basics', colors: ['#F5F5DC', '#D2B48C', '#8B7355', '#654321'] },
  { name: 'Bold & Bright', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'] },
  { name: 'Monochrome', colors: ['#FFFFFF', '#D3D3D3', '#808080', '#000000'] },
  { name: 'Pastels', colors: ['#FFB6C1', '#E6E6FA', '#F0E68C', '#98FB98'] },
];

export default function ExploreScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  // Category filtering functionality can be added here in the future
  // const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const AnimatedCard = ({ children, delay = 0, style = {} }: any) => {
    const [cardAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  const TrendCard = ({ trend, index }: { trend: TrendItem; index: number }) => (
    <AnimatedCard delay={index * 100} style={styles.trendCard}>
      <TouchableOpacity style={styles.trendButton}>
        <BlurView intensity={20} tint="light" style={styles.trendBlur}>
          <LinearGradient
            colors={[trend.color, `${trend.color}80`]}
            style={styles.trendGradient}
          >
            <View style={styles.trendHeader}>
              <Ionicons name={trend.icon as any} size={32} color="white" />
              <Text style={styles.trendCategory}>{trend.category}</Text>
            </View>
            <Text style={styles.trendTitle}>{trend.title}</Text>
            <Text style={styles.trendDescription}>{trend.description}</Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const CollectionCard = ({ collection, index }: { collection: StyleCollection; index: number }) => (
    <AnimatedCard delay={index * 150} style={styles.collectionCard}>
      <TouchableOpacity 
        style={styles.collectionButton}
        onPress={() => router.push('/wardrobe-assessment')}
      >
        <BlurView intensity={30} tint="light" style={styles.collectionBlur}>
          <View style={styles.collectionContent}>
            <LinearGradient
              colors={[collection.color, `${collection.color}60`]}
              style={styles.collectionIcon}
            >
              <Ionicons name={collection.icon as any} size={24} color="white" />
            </LinearGradient>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionName}>{collection.name}</Text>
              <Text style={styles.collectionDescription}>{collection.description}</Text>
              <Text style={styles.collectionCount}>{collection.items} outfits</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#667eea" />
          </View>
        </BlurView>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const ColorPalette = ({ palette, index }: { palette: any; index: number }) => (
    <AnimatedCard delay={index * 200} style={styles.paletteCard}>
      <BlurView intensity={20} tint="light" style={styles.paletteBlur}>
        <Text style={styles.paletteName}>{palette.name}</Text>
        <View style={styles.colorsContainer}>
          {palette.colors.map((color: string, idx: number) => (
            <View
              key={idx}
              style={[styles.colorCircle, { backgroundColor: color }]}
            />
          ))}
        </View>
      </BlurView>
    </AnimatedCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Fashion Explorer</Text>
            <Text style={styles.subtitle}>Discover trends & inspiration</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Fashion Trends Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={24} color="white" />
                <Text style={styles.sectionTitle}>Trending Now</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Current fashion trends and styles
              </Text>
              <View style={styles.trendsGrid}>
                {FASHION_TRENDS.map((trend, index) => (
                  <TrendCard key={trend.id} trend={trend} index={index} />
                ))}
              </View>
            </View>

            {/* Style Collections */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="albums" size={24} color="white" />
                <Text style={styles.sectionTitle}>Style Collections</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Curated outfit combinations for every occasion
              </Text>
              <View style={styles.collectionsContainer}>
                {STYLE_COLLECTIONS.map((collection, index) => (
                  <CollectionCard key={collection.id} collection={collection} index={index} />
                ))}
              </View>
            </View>

            {/* Color Palettes */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="color-palette" size={24} color="white" />
                <Text style={styles.sectionTitle}>Color Palettes</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Perfect color combinations for your outfits
              </Text>
              <View style={styles.palettesGrid}>
                {COLOR_PALETTES.map((palette, index) => (
                  <ColorPalette key={index} palette={palette} index={index} />
                ))}
              </View>
            </View>

            {/* Fashion Tips */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color="white" />
                <Text style={styles.sectionTitle}>Style Tips</Text>
              </View>
              <AnimatedCard delay={600}>
                <BlurView intensity={20} tint="light" style={styles.tipsCard}>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    <Text style={styles.tipText}>Mix textures to add depth to your outfit</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    <Text style={styles.tipText}>Invest in quality basics for versatility</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    <Text style={styles.tipText}>Accessorize to transform any look</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    <Text style={styles.tipText}>Confidence is your best accessory</Text>
                  </View>
                </BlurView>
              </AnimatedCard>
            </View>

            {/* Call to Action */}
            <AnimatedCard delay={800}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/wardrobe-assessment')}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.ctaGradient}
                >
                  <Ionicons name="sparkles" size={24} color="white" />
                  <Text style={styles.ctaText}>Start Your Style Journey</Text>
                </LinearGradient>
              </TouchableOpacity>
            </AnimatedCard>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
  },
  trendButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendBlur: {
    borderRadius: 16,
  },
  trendGradient: {
    padding: 16,
    minHeight: 120,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendCategory: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  collectionsContainer: {
    gap: 12,
  },
  collectionCard: {
    marginBottom: 8,
  },
  collectionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  collectionBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  palettesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paletteCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
  },
  paletteBlur: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  paletteName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
