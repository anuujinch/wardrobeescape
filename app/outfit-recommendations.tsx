import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AIOutfitRecommendationService,
    OutfitRecommendation,
    UserPreferences
} from '../services/AIOutfitRecommendationService';

export default function OutfitRecommendationsScreen() {
  const params = useLocalSearchParams();
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitRecommendation | null>(null);
  const [wardrobeGaps, setWardrobeGaps] = useState<string[]>([]);
  const [missingItems, setMissingItems] = useState<any[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      // Parse wardrobe data from params
      const wardrobeData = params.wardrobe ? JSON.parse(params.wardrobe as string) : [];
      const preferences: UserPreferences = {
        eventType: params.eventType as string || 'Casual',
        mood: params.mood as string || 'Comfortable'
      };

      console.log('Generating outfits with wardrobe:', wardrobeData);
      console.log('Preferences:', preferences);

      // Generate AI recommendations
      const aiService = new AIOutfitRecommendationService();
      const recs = aiService.generateOutfitRecommendations(wardrobeData, preferences);
      
      // Enhanced outfit creation with missing item suggestions
      const enhancedRecs = recs.map(rec => {
        const missingPieces = suggestMissingPieces(rec, wardrobeData, preferences);
        return {
          ...rec,
          missingPieces,
          completeOutfit: [...rec.items, ...missingPieces]
        };
      });
      
      setRecommendations(enhancedRecs);

      // Analyze wardrobe gaps
      const gaps = aiService.analyzeWardrobeGaps(wardrobeData);
      setWardrobeGaps(gaps);

      if (enhancedRecs.length > 0) {
        setSelectedOutfit(enhancedRecs[0]);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestMissingPieces = (outfit: OutfitRecommendation, wardrobe: any[], preferences: UserPreferences) => {
    const missing = [];
    const categories = outfit.items.map(item => item.category);
    
    // Essential pieces based on event type
    const essentialPieces = {
      'Work': ['Tops', 'Bottoms', 'Shoes'],
      'Formal': ['Tops', 'Bottoms', 'Shoes', 'Outerwear'],
      'Casual': ['Tops', 'Bottoms'],
      'Date Night': ['Tops', 'Bottoms', 'Shoes', 'Accessories'],
      'Party': ['Tops', 'Bottoms', 'Shoes', 'Accessories']
    };

    const required = essentialPieces[preferences.eventType] || ['Tops', 'Bottoms'];
    
    required.forEach(requiredCategory => {
      if (!categories.includes(requiredCategory)) {
        // Suggest an item to buy
        const suggestion = generateSuggestion(requiredCategory, preferences);
        missing.push({
          ...suggestion,
          isSuggestion: true,
          category: requiredCategory
        });
      }
    });

    return missing;
  };

  const generateSuggestion = (category: string, preferences: UserPreferences) => {
    const suggestions = {
      'Tops': {
        'Work': { name: 'Professional Blouse', description: 'A crisp white or neutral colored blouse' },
        'Formal': { name: 'Dress Shirt', description: 'Elegant button-down shirt' },
        'Casual': { name: 'Comfortable T-Shirt', description: 'Soft cotton tee in your favorite color' },
        'Date Night': { name: 'Stylish Top', description: 'Flattering blouse or nice sweater' },
        'Party': { name: 'Statement Top', description: 'Eye-catching blouse or party shirt' }
      },
      'Bottoms': {
        'Work': { name: 'Dress Pants', description: 'Professional trousers or pencil skirt' },
        'Formal': { name: 'Formal Trousers', description: 'Well-tailored dress pants' },
        'Casual': { name: 'Comfortable Jeans', description: 'Well-fitting denim or casual pants' },
        'Date Night': { name: 'Stylish Bottoms', description: 'Flattering jeans or dress pants' },
        'Party': { name: 'Party Bottoms', description: 'Trendy pants or skirt' }
      },
      'Shoes': {
        'Work': { name: 'Professional Shoes', description: 'Comfortable dress shoes or heels' },
        'Formal': { name: 'Dress Shoes', description: 'Elegant formal footwear' },
        'Casual': { name: 'Casual Sneakers', description: 'Comfortable everyday shoes' },
        'Date Night': { name: 'Nice Shoes', description: 'Stylish shoes that complete the look' },
        'Party': { name: 'Party Shoes', description: 'Fun, stylish footwear' }
      },
      'Accessories': {
        'default': { name: 'Accessories', description: 'Jewelry, bag, or scarf to complete the look' }
      },
      'Outerwear': {
        'default': { name: 'Jacket', description: 'A blazer or coat for the occasion' }
      }
    };

    const categoryItems = suggestions[category];
    if (categoryItems) {
      return categoryItems[preferences.eventType] || categoryItems['default'] || categoryItems[Object.keys(categoryItems)[0]];
    }
    
    return { name: `${category} Item`, description: `A nice ${category.toLowerCase()} piece for this occasion` };
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return '#28a745';
      case 'Medium': return '#ffc107';
      case 'Low': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'High': return 'checkmark-circle';
      case 'Medium': return 'warning';
      case 'Low': return 'help-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>AI is crafting your perfect outfit...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Outfit Recommendations</Text>
          <TouchableOpacity onPress={generateRecommendations} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Event & Mood Info */}
          <View style={styles.preferencesCard}>
            <BlurView intensity={20} tint="light" style={styles.preferencesBlur}>
              <Text style={styles.preferencesTitle}>Your Preferences</Text>
              <View style={styles.preferencesRow}>
                <View style={styles.preferenceItem}>
                  <Ionicons name="calendar-outline" size={20} color="white" />
                  <Text style={styles.preferenceText}>{params.eventType}</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Ionicons name="heart-outline" size={20} color="white" />
                  <Text style={styles.preferenceText}>{params.mood}</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Outfit Recommendations */}
          {recommendations.map((outfit, index) => (
            <View key={outfit.id} style={styles.outfitCard}>
              <BlurView intensity={20} tint="light" style={styles.outfitBlur}>
                <LinearGradient
                  colors={index === 0 ? ['#f093fb', '#f5576c'] : ['#667eea', '#764ba2']}
                  style={styles.outfitHeader}
                >
                  <View style={styles.outfitHeaderContent}>
                    <Text style={styles.outfitTitle}>Outfit {index + 1}</Text>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>Match: {Math.round(outfit.score)}%</Text>
                      <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(outfit.confidenceLevel) }]}>
                        <Ionicons name={getConfidenceIcon(outfit.confidenceLevel)} size={12} color="white" />
                        <Text style={styles.confidenceText}>{outfit.confidenceLevel}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                {/* Your Items */}
                <View style={styles.outfitItems}>
                  <Text style={styles.sectionTitle}>From Your Wardrobe</Text>
                  <View style={styles.itemsGrid}>
                    {outfit.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.itemCard}>
                        <View style={styles.itemIconContainer}>
                          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                        </View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Missing/Suggested Items */}
                  {outfit.missingPieces?.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Suggested to Complete Look</Text>
                      <View style={styles.itemsGrid}>
                        {outfit.missingPieces.map((item, itemIndex) => (
                          <View key={itemIndex} style={[styles.itemCard, styles.suggestedItem]}>
                            <View style={styles.itemIconContainer}>
                              <Ionicons name="add-circle" size={16} color="#f5576c" />
                            </View>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemCategory}>{item.category}</Text>
                            <Text style={styles.suggestionDescription}>{item.description}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>

                {/* Reasoning */}
                <View style={styles.reasoningSection}>
                  <Text style={styles.sectionTitle}>Why This Works</Text>
                  <Text style={styles.reasoningText}>{outfit.reasoning}</Text>
                </View>

                {/* Style Notes */}
                {outfit.styleNotes && outfit.styleNotes.length > 0 && (
                  <View style={styles.styleNotesSection}>
                    <Text style={styles.sectionTitle}>Style Tips</Text>
                    {outfit.styleNotes.map((note, noteIndex) => (
                      <View key={noteIndex} style={styles.styleNote}>
                        <Ionicons name="bulb-outline" size={16} color="#f5576c" />
                        <Text style={styles.styleNoteText}>{note}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </BlurView>
            </View>
          ))}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Save Favorite Outfits</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={generateRecommendations}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.secondaryButtonText}>Generate New Ideas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const getItemIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Tops': 'shirt',
    'Bottoms': 'pants',
    'Dresses': 'dress',
    'Outerwear': 'jacket',
    'Shoes': 'shoe',
    'Accessories': 'watch'
  };
  return icons[category] || 'shirt';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'transparent', // Make header transparent
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)', // Semi-transparent border
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  preferencesCard: {
    backgroundColor: 'transparent', // Make card transparent
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  preferencesBlur: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white background
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  preferencesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceText: {
    fontSize: 14,
    color: 'white',
  },
  noRecommendationsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noRecommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noRecommendationsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  selectedTabText: {
    color: 'white',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  outfitCard: {
    backgroundColor: 'transparent', // Make outfit card transparent
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outfitBlur: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white background
  },
  outfitHeader: {
    padding: 20,
  },
  outfitHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outfitTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  scoreText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  outfitItems: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white background
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent white background
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)', // Semi-transparent white color
    textAlign: 'center',
  },
  suggestedItem: {
    backgroundColor: 'rgba(255,255,255,0.05)', // Semi-transparent white background
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Semi-transparent border
  },
  suggestionDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)', // Semi-transparent white color
    marginTop: 4,
  },
  reasoningSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)', // Semi-transparent border
  },
  reasoningText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  styleNotesSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)', // Semi-transparent border
  },
  styleNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  styleNoteText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
    lineHeight: 20,
  },
  gapsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gapsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  gapsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  gapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  gapText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: 'transparent', // Make button transparent
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'white', // White border
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent', // Make button transparent
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'white', // White border
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});