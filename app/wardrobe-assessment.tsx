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
    TextInput,
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

const COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 
  'Black', 'White', 'Gray', 'Navy', 'Beige', 'Cream', 'Maroon', 'Teal'
];

const MATERIALS = [
  'Cotton', 'Denim', 'Leather', 'Wool', 'Silk', 'Polyester', 'Linen', 
  'Cashmere', 'Velvet', 'Synthetic', 'Canvas', 'Fleece'
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
  const [isAddClothesModalVisible, setIsAddClothesModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Add clothes form state
  const [newClothingName, setNewClothingName] = useState('');
  const [newClothingColor, setNewClothingColor] = useState('');
  const [newClothingMaterial, setNewClothingMaterial] = useState('');
  const [newClothingOccasions, setNewClothingOccasions] = useState<string[]>([]);

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

  const handleAddClothingItem = () => {
    if (!selectedCategory) {
      Alert.alert('No Category Selected', 'Please select a category first!');
      return;
    }
    if (!newClothingName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the clothing item!');
      return;
    }
    if (!newClothingColor) {
      Alert.alert('Missing Color', 'Please select a color!');
      return;
    }
    if (!newClothingMaterial) {
      Alert.alert('Missing Material', 'Please select a material!');
      return;
    }

    const categoryInfo = CLOTHING_CATEGORIES.find(cat => cat.id === selectedCategory);
    const newItem: WardrobeItem = {
      id: Date.now().toString(),
      name: newClothingName.trim(),
      category: selectedCategory,
      color: newClothingColor,
      material: newClothingMaterial,
      occasion: newClothingOccasions.length > 0 ? newClothingOccasions : ['casual'],
      icon: categoryInfo?.icon || 'shirt-outline',
    };

    setWardrobeItems(prev => [...prev, newItem]);
    
    // Reset form
    setNewClothingName('');
    setNewClothingColor('');
    setNewClothingMaterial('');
    setNewClothingOccasions([]);
    setIsAddClothesModalVisible(false);
    
    Alert.alert('Success!', `${newItem.name} has been added to your wardrobe!`);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wardrobe?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setWardrobeItems(prev => prev.filter(item => item.id !== itemId))
        }
      ]
    );
  };

  const toggleOccasion = (occasionId: string) => {
    setNewClothingOccasions(prev => 
      prev.includes(occasionId) 
        ? prev.filter(id => id !== occasionId)
        : [...prev, occasionId]
    );
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
        onPress={() => {
          setSelectedCategory(category.id);
          setIsAddClothesModalVisible(true);
        }}
      >
        <BlurView intensity={20} tint="light" style={styles.categoryBlur}>
          <LinearGradient
            colors={[category.color, `${category.color}80`]}
            style={styles.categoryGradient}
          >
            <Ionicons name={category.icon} size={32} color="white" />
            <Text style={styles.categoryText}>{category.name}</Text>
            <View style={styles.addIconContainer}>
              <Ionicons name="add-circle" size={20} color="white" />
            </View>
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
              <Text style={styles.sectionTitle}>Add Clothing Items</Text>
              <Text style={styles.sectionDescription}>
                Tap any category to add clothes to your wardrobe
              </Text>
              <View style={styles.categoriesGrid}>
                {CLOTHING_CATEGORIES.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))}
              </View>
            </View>

            {/* Wardrobe Items */}
            <View style={styles.section}>
              <View style={styles.wardrobeHeader}>
                <Text style={styles.sectionTitle}>Your Wardrobe</Text>
                <Text style={styles.itemCount}>{wardrobeItems.length} items</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Long press any item to remove it
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
                {wardrobeItems.map((item, index) => (
                  <AnimatedCard key={item.id} delay={index * 100} style={styles.wardrobeItem}>
                    <TouchableOpacity
                      style={styles.wardrobeItemContainer}
                      onLongPress={() => handleRemoveItem(item.id)}
                    >
                      <BlurView intensity={20} tint="light" style={styles.wardrobeItemBlur}>
                        <Ionicons name={item.icon} size={24} color="#667eea" />
                        <Text style={styles.wardrobeItemName}>{item.name}</Text>
                        <Text style={styles.wardrobeItemDetails}>{item.color} {item.material}</Text>
                        <Text style={styles.wardrobeItemCategory}>{item.category}</Text>
                      </BlurView>
                    </TouchableOpacity>
                  </AnimatedCard>
                ))}
                {wardrobeItems.length === 0 && (
                  <View style={styles.emptyWardrobe}>
                    <Ionicons name="shirt-outline" size={48} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.emptyWardrobeText}>No items yet</Text>
                    <Text style={styles.emptyWardrobeSubtext}>Tap a category above to add clothes</Text>
                  </View>
                )}
              </ScrollView>
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

        {/* Add Clothes Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAddClothesModalVisible}
          onRequestClose={() => setIsAddClothesModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} tint="dark" style={styles.addClothesModalBlur}>
              <ScrollView contentContainerStyle={styles.addClothesModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.addClothesModalTitle}>
                    Add {CLOTHING_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsAddClothesModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Item Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newClothingName}
                    onChangeText={setNewClothingName}
                    placeholder="e.g., Blue Cotton T-Shirt"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Color *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorOptions}>
                    {COLORS.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          newClothingColor === color && styles.selectedColorOption
                        ]}
                        onPress={() => setNewClothingColor(color)}
                      >
                        <Text style={[
                          styles.colorOptionText,
                          newClothingColor === color && styles.selectedColorOptionText
                        ]}>
                          {color}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Material *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materialOptions}>
                    {MATERIALS.map(material => (
                      <TouchableOpacity
                        key={material}
                        style={[
                          styles.materialOption,
                          newClothingMaterial === material && styles.selectedMaterialOption
                        ]}
                        onPress={() => setNewClothingMaterial(material)}
                      >
                        <Text style={[
                          styles.materialOptionText,
                          newClothingMaterial === material && styles.selectedMaterialOptionText
                        ]}>
                          {material}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Suitable Occasions (Optional)</Text>
                  <View style={styles.occasionGrid}>
                    {EVENT_TYPES.map(event => (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.occasionOption,
                          newClothingOccasions.includes(event.id) && styles.selectedOccasionOption
                        ]}
                        onPress={() => toggleOccasion(event.id)}
                      >
                        <Ionicons 
                          name={event.icon} 
                          size={16} 
                          color={newClothingOccasions.includes(event.id) ? 'white' : '#667eea'} 
                        />
                        <Text style={[
                          styles.occasionOptionText,
                          newClothingOccasions.includes(event.id) && styles.selectedOccasionOptionText
                        ]}>
                          {event.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsAddClothesModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddClothingItem}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.addButtonGradient}
                    >
                      <Text style={styles.addButtonText}>Add to Wardrobe</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Modal>

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
                  1. Tap clothing categories to add items to your wardrobe{'\n'}
                  2. Fill in details like name, color, and material{'\n'}
                  3. Choose your event type and mood{'\n'}
                  4. Let our AI generate perfect outfit recommendations{'\n'}
                  5. Long press wardrobe items to remove them
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
    position: 'relative',
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  addIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: 'white',
  },
  wardrobeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
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
  wardrobeItemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  wardrobeItemBlur: {
    padding: 16,
    alignItems: 'center',
    minWidth: 140,
  },
  wardrobeItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginTop: 8,
  },
  wardrobeItemDetails: {
    fontSize: 10,
    color: 'rgba(102, 126, 234, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  wardrobeItemCategory: {
    fontSize: 10,
    color: 'rgba(102, 126, 234, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyWardrobe: {
    alignItems: 'center',
    padding: 40,
    minWidth: width - 40,
  },
  emptyWardrobeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
  },
  emptyWardrobeSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    textAlign: 'center',
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
  // Add Clothes Modal Styles
  addClothesModalBlur: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  addClothesModalContent: {
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  addClothesModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorOptions: {
    flexDirection: 'row',
  },
  colorOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedColorOption: {
    backgroundColor: '#667eea',
    borderColor: 'white',
  },
  colorOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedColorOptionText: {
    color: 'white',
  },
  materialOptions: {
    flexDirection: 'row',
  },
  materialOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedMaterialOption: {
    backgroundColor: '#764ba2',
    borderColor: 'white',
  },
  materialOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedMaterialOptionText: {
    color: 'white',
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  occasionOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedOccasionOption: {
    backgroundColor: '#f093fb',
    borderColor: 'white',
  },
  occasionOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  selectedOccasionOptionText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});