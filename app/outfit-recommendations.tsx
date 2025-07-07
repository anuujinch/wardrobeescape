import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    aiOutfitService,
    OutfitRecommendation,
    UserPreferences
} from '../services/AIOutfitRecommendationService';

export default function OutfitRecommendationsScreen() {
  const params = useLocalSearchParams();
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitRecommendation | null>(null);
  const [wardrobeGaps, setWardrobeGaps] = useState<string[]>([]);

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

      // Generate AI recommendations
      const recs = aiOutfitService.generateOutfitRecommendations(wardrobeData, preferences);
      setRecommendations(recs);

      // Analyze wardrobe gaps
      const gaps = aiOutfitService.analyzeWardrobeGaps(wardrobeData);
      setWardrobeGaps(gaps);

      if (recs.length > 0) {
        setSelectedOutfit(recs[0]);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>AI is crafting your perfect outfit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Outfit Recommendations</Text>
          <TouchableOpacity onPress={generateRecommendations}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Event & Mood Info */}
        <View style={styles.preferencesCard}>
          <Text style={styles.preferencesTitle}>Your Preferences</Text>
          <View style={styles.preferencesRow}>
            <View style={styles.preferenceItem}>
              <Ionicons name="calendar" size={20} color="#667eea" />
              <Text style={styles.preferenceText}>{params.eventType}</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Ionicons name="happy" size={20} color="#667eea" />
              <Text style={styles.preferenceText}>{params.mood}</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <View style={styles.noRecommendationsCard}>
            <Ionicons name="shirt" size={48} color="#ccc" />
            <Text style={styles.noRecommendationsTitle}>No Outfits Found</Text>
            <Text style={styles.noRecommendationsText}>
              Add more items to your wardrobe to get better recommendations
            </Text>
          </View>
        ) : (
          <>
            {/* Outfit Selection Tabs */}
            <View style={styles.tabContainer}>
              {recommendations.map((rec, index) => (
                <TouchableOpacity
                  key={rec.id}
                  style={[
                    styles.tab,
                    selectedOutfit?.id === rec.id && styles.selectedTab
                  ]}
                  onPress={() => setSelectedOutfit(rec)}
                >
                  <Text style={[
                    styles.tabText,
                    selectedOutfit?.id === rec.id && styles.selectedTabText
                  ]}>
                    Outfit {index + 1}
                  </Text>
                  <View style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceColor(rec.confidenceLevel) }
                  ]}>
                    <Ionicons 
                      name={getConfidenceIcon(rec.confidenceLevel)} 
                      size={12} 
                      color="white" 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Outfit Details */}
            {selectedOutfit && (
              <View style={styles.outfitCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.outfitHeader}
                >
                  <View style={styles.outfitHeaderContent}>
                    <Text style={styles.outfitTitle}>
                      {selectedOutfit.id.replace('outfit-', 'Outfit ')}
                    </Text>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>Score: {selectedOutfit.score}</Text>
                      <View style={[
                        styles.confidenceBadge,
                        { backgroundColor: getConfidenceColor(selectedOutfit.confidenceLevel) }
                      ]}>
                        <Ionicons 
                          name={getConfidenceIcon(selectedOutfit.confidenceLevel)} 
                          size={16} 
                          color="white" 
                        />
                        <Text style={styles.confidenceText}>
                          {selectedOutfit.confidenceLevel}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                {/* Outfit Items */}
                <View style={styles.outfitItems}>
                  <Text style={styles.sectionTitle}>Your Outfit</Text>
                  <View style={styles.itemsGrid}>
                    {selectedOutfit.items.map((item, index) => (
                      <View key={`${item.id}-${index}`} style={styles.itemCard}>
                        <View style={styles.itemIcon}>
                          <Ionicons 
                            name={getItemIcon(item.category)} 
                            size={24} 
                            color="#667eea" 
                          />
                        </View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* AI Reasoning */}
                <View style={styles.reasoningSection}>
                  <Text style={styles.sectionTitle}>Why This Works</Text>
                  <Text style={styles.reasoningText}>{selectedOutfit.reasoning}</Text>
                </View>

                {/* Style Notes */}
                <View style={styles.styleNotesSection}>
                  <Text style={styles.sectionTitle}>Style Notes</Text>
                  {selectedOutfit.styleNotes.map((note, index) => (
                    <View key={index} style={styles.styleNote}>
                      <Ionicons name="bulb" size={16} color="#ffc107" />
                      <Text style={styles.styleNoteText}>{note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Wardrobe Gaps */}
        {wardrobeGaps.length > 0 && (
          <View style={styles.gapsCard}>
            <Text style={styles.gapsTitle}>Wardrobe Suggestions</Text>
            <Text style={styles.gapsSubtitle}>
              Consider adding these items for more outfit options:
            </Text>
            {wardrobeGaps.map((gap, index) => (
              <View key={index} style={styles.gapItem}>
                <Ionicons name="add-circle" size={16} color="#28a745" />
                <Text style={styles.gapText}>{gap}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/wardrobe-assessment')}
          >
            <Ionicons name="shirt" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Add More Items</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home" size={24} color="#667eea" />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  preferencesCard: {
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
  preferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#666',
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
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#333',
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  reasoningSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reasoningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  styleNotesSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  styleNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  styleNoteText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#667eea',
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
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});