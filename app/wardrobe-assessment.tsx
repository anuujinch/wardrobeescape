import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AIOutfitRecommendationService } from '../services/AIOutfitRecommendationService';

const { width, height } = Dimensions.get('window');

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  material: string;
  occasion: string[];
  icon: string;
  image?: string;
}

interface Filters {
  eventType: string;
  mood: string;
  weather: string;
  timeOfDay: string;
}

const CLOTHING_CATEGORIES = [
  { id: 'tops', name: 'Tops', icon: 'shirt-outline', color: '#667eea' },
  { id: 'bottoms', name: 'Bottoms', icon: 'fitness-outline', color: '#764ba2' },
  { id: 'dresses', name: 'Dresses', icon: 'woman-outline', color: '#f093fb' },
  { id: 'shoes', name: 'Shoes', icon: 'footsteps-outline', color: '#f5576c' },
  { id: 'accessories', name: 'Accessories', icon: 'diamond-outline', color: '#4facfe' },
  { id: 'outerwear', name: 'Outerwear', icon: 'snow-outline', color: '#00f2fe' },
];

const EVENT_TYPES = [
  { id: 'work', name: 'Work', icon: 'briefcase-outline', color: '#667eea' },
  { id: 'casual', name: 'Casual', icon: 'cafe-outline', color: '#764ba2' },
  { id: 'date', name: 'Date Night', icon: 'heart-outline', color: '#f093fb' },
  { id: 'party', name: 'Party', icon: 'champagne-outline', color: '#f5576c' },
  { id: 'formal', name: 'Formal', icon: 'ribbon-outline', color: '#4facfe' },
  { id: 'workout', name: 'Workout', icon: 'fitness-outline', color: '#00f2fe' },
];

const MOOD_TYPES = [
  { id: 'confident', name: 'Confident', icon: 'flash-outline', color: '#667eea' },
  { id: 'comfortable', name: 'Comfortable', icon: 'home-outline', color: '#764ba2' },
  { id: 'trendy', name: 'Trendy', icon: 'trending-up-outline', color: '#f093fb' },
  { id: 'elegant', name: 'Elegant', icon: 'diamond-outline', color: '#f5576c' },
  { id: 'playful', name: 'Playful', icon: 'happy-outline', color: '#4facfe' },
  { id: 'minimalist', name: 'Minimalist', icon: 'remove-outline', color: '#00f2fe' },
];

export default function WardrobeAssessment() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [filters, setFilters] = useState<Filters>({
    eventType: '',
    mood: '',
    weather: 'mild',
    timeOfDay: 'day',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    initializeWardrobe();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
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
  };

  const initializeWardrobe = () => {
    const sampleItems: WardrobeItem[] = [
      {
        id: '1',
        name: 'White Button-Down Shirt',
        category: 'tops',
        color: 'white',
        material: 'cotton',
        occasion: ['work', 'casual', 'formal'],
        icon: 'shirt-outline',
      },
      {
        id: '2',
        name: 'Black Skinny Jeans',
        category: 'bottoms',
        color: 'black',
        material: 'denim',
        occasion: ['casual', 'date', 'party'],
        icon: 'fitness-outline',
      },
      {
        id: '3',
        name: 'Little Black Dress',
        category: 'dresses',
        color: 'black',
        material: 'polyester',
        occasion: ['date', 'party', 'formal'],
        icon: 'woman-outline',
      },
      {
        id: '4',
        name: 'Black Leather Boots',
        category: 'shoes',
        color: 'black',
        material: 'leather',
        occasion: ['work', 'casual', 'date'],
        icon: 'footsteps-outline',
      },
      {
        id: '5',
        name: 'Statement Necklace',
        category: 'accessories',
        color: 'gold',
        material: 'metal',
        occasion: ['date', 'party', 'formal'],
        icon: 'diamond-outline',
      },
    ];
    setWardrobeItems(sampleItems);
  };

  const handleGenerateOutfit = async () => {
    if (!filters.eventType || !filters.mood) {
      Alert.alert('Missing Information', 'Please select an event type and mood first!');
      return;
    }

    if (wardrobeItems.length === 0) {
      Alert.alert('Empty Wardrobe', 'Please add some clothing items to your wardrobe first!');
      return;
    }

    try {
      const recommendations = await AIOutfitRecommendationService.generateOutfitRecommendations(
        wardrobeItems,
        filters.eventType,
        filters.mood,
        {
          weather: filters.weather,
          timeOfDay: filters.timeOfDay,
        }
      );

      router.push({
        pathname: '/outfit-recommendations',
        params: {
          recommendations: JSON.stringify(recommendations),
          eventType: filters.eventType,
          mood: filters.mood,
        },
      });
    } catch (error) {
      console.error('Error generating outfit:', error);
      Alert.alert('Error', 'Failed to generate outfit recommendations. Please try again.');
    }
  };

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
                  outputRange: [30, 0],
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

  const CategoryCard = ({ category, index }: { category: any; index: number }) => (
    <AnimatedCard delay={index * 100} style={styles.categoryCard}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === category.id && styles.selectedCategory,
        ]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <BlurView intensity={20} tint="light" style={styles.categoryBlur}>
          <LinearGradient
            colors={[category.color, `${category.color}80`]}
            style={styles.categoryGradient}
          >
            <Ionicons name={category.icon} size={32} color="white" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const FilterSection = ({ title, options, selectedValue, onSelect, icon }: any) => (
    <View style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Ionicons name={icon} size={20} color="#667eea" />
        <Text style={styles.filterTitle}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
        {options.map((option: any, index: number) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterOption,
              selectedValue === option.id && styles.selectedFilter,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <LinearGradient
              colors={selectedValue === option.id ? [option.color, `${option.color}80`] : ['#f8f9fa', '#e9ecef']}
              style={styles.filterGradient}
            >
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={selectedValue === option.id ? 'white' : '#667eea'} 
              />
              <Text style={[
                styles.filterOptionText,
                selectedValue === option.id && styles.selectedFilterText,
              ]}>
                {option.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[styles.progressFill, { width: `${((currentStep + 1) / 3) * 100}%` }]}
        />
      </View>
      <Text style={styles.progressText}>Step {currentStep + 1} of 3</Text>
    </View>
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Build Your Wardrobe</Text>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="help-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ProgressBar />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clothing Categories</Text>
              <Text style={styles.sectionDescription}>
                Select a category to add items to your wardrobe
              </Text>
              <View style={styles.categoriesGrid}>
                {CLOTHING_CATEGORIES.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))}
              </View>
            </View>

            {/* Event Type Filter */}
            <FilterSection
              title="Event Type"
              options={EVENT_TYPES}
              selectedValue={filters.eventType}
              onSelect={(value: string) => setFilters({ ...filters, eventType: value })}
              icon="calendar-outline"
            />

            {/* Mood Filter */}
            <FilterSection
              title="Mood"
              options={MOOD_TYPES}
              selectedValue={filters.mood}
              onSelect={(value: string) => setFilters({ ...filters, mood: value })}
              icon="heart-outline"
            />

            {/* Wardrobe Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Wardrobe</Text>
              <Text style={styles.sectionDescription}>
                {wardrobeItems.length} items ready for styling
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
                {wardrobeItems.map((item, index) => (
                  <AnimatedCard key={item.id} delay={index * 100} style={styles.wardrobeItem}>
                    <BlurView intensity={20} tint="light" style={styles.wardrobeItemBlur}>
                      <Ionicons name={item.icon} size={24} color="#667eea" />
                      <Text style={styles.wardrobeItemName}>{item.name}</Text>
                      <Text style={styles.wardrobeItemCategory}>{item.category}</Text>
                    </BlurView>
                  </AnimatedCard>
                ))}
              </ScrollView>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateOutfit}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.generateGradient}
              >
                <Ionicons name="sparkles" size={24} color="white" />
                <Text style={styles.generateButtonText}>Generate AI Outfit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Help Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How to Use</Text>
                <Text style={styles.modalText}>
                  1. Select clothing categories to build your wardrobe{'\n'}
                  2. Choose your event type and mood{'\n'}
                  3. Let our AI generate perfect outfit recommendations{'\n'}
                  4. Save your favorite combinations
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  helpButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
  },
  categoryButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  categoryBlur: {
    padding: 20,
    alignItems: 'center',
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: 'white',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#667eea',
  },
  selectedFilter: {
    transform: [{ scale: 1.05 }],
  },
  selectedFilterText: {
    color: 'white',
  },
  wardrobeItems: {
    flexDirection: 'row',
  },
  wardrobeItem: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  wardrobeItemBlur: {
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  wardrobeItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginTop: 8,
  },
  wardrobeItemCategory: {
    fontSize: 10,
    color: 'rgba(102, 126, 234, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  generateButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});