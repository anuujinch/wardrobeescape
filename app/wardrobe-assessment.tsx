import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
}

export default function WardrobeAssessmentScreen() {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([
    // Sample items to demonstrate AI functionality
    { id: '1', name: 'Black Blazer', category: 'Outerwear' },
    { id: '2', name: 'White Button Shirt', category: 'Tops' },
    { id: '3', name: 'Dark Jeans', category: 'Bottoms' },
    { id: '4', name: 'Leather Boots', category: 'Shoes' },
    { id: '5', name: 'Casual T-Shirt', category: 'Tops' },
    { id: '6', name: 'Dress Pants', category: 'Bottoms' },
  ]);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [eventType, setEventType] = useState('');
  const [mood, setMood] = useState('');

  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
  const eventTypes = ['Work', 'Casual', 'Date Night', 'Party', 'Formal', 'Exercise'];
  const moods = ['Confident', 'Comfortable', 'Trendy', 'Classic', 'Bold', 'Relaxed'];

  const addClothingItem = () => {
    if (newItem.trim() && selectedCategory) {
      const item: ClothingItem = {
        id: Date.now().toString(),
        name: newItem.trim(),
        category: selectedCategory,
      };
      setWardrobe([...wardrobe, item]);
      setNewItem('');
      setSelectedCategory('');
    } else {
      Alert.alert('Error', 'Please enter an item name and select a category');
    }
  };

  const removeClothingItem = (id: string) => {
    setWardrobe(wardrobe.filter(item => item.id !== id));
  };

  const generateOutfit = () => {
    if (wardrobe.length === 0) {
      Alert.alert('No Items', 'Please add some clothing items to your wardrobe first');
      return;
    }
    
    if (!eventType || !mood) {
      Alert.alert('Missing Information', 'Please select an event type and mood');
      return;
    }

    // Navigate to AI outfit recommendations screen
    const wardrobeParam = JSON.stringify(wardrobe);
    router.push({
      pathname: '/outfit-recommendations',
      params: {
        wardrobe: wardrobeParam,
        eventType,
        mood,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Wardrobe Assessment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Add Clothing Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Clothing Items</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter clothing item name"
              value={newItem}
              onChangeText={setNewItem}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedCategoryChip,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.addButton} onPress={addClothingItem}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Wardrobe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Wardrobe ({wardrobe.length} items)</Text>
          {wardrobe.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet</Text>
          ) : (
            <View style={styles.wardrobeGrid}>
              {wardrobe.map((item) => (
                <View key={item.id} style={styles.wardrobeItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeClothingItem(item.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Event Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Type</Text>
          <View style={styles.optionsGrid}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  eventType === type && styles.selectedOptionChip,
                ]}
                onPress={() => setEventType(type)}
              >
                <Text style={[
                  styles.optionText,
                  eventType === type && styles.selectedOptionText,
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.optionsGrid}>
            {moods.map((moodOption) => (
              <TouchableOpacity
                key={moodOption}
                style={[
                  styles.optionChip,
                  mood === moodOption && styles.selectedOptionChip,
                ]}
                onPress={() => setMood(moodOption)}
              >
                <Text style={[
                  styles.optionText,
                  mood === moodOption && styles.selectedOptionText,
                ]}>
                  {moodOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Start Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickStartContainer}>
            <TouchableOpacity 
              style={styles.quickStartButton}
              onPress={() => {
                setEventType('Work');
                setMood('Confident');
              }}
            >
              <Ionicons name="briefcase" size={20} color="#667eea" />
              <Text style={styles.quickStartText}>Work Day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickStartButton}
              onPress={() => {
                setEventType('Date Night');
                setMood('Bold');
              }}
            >
              <Ionicons name="heart" size={20} color="#667eea" />
              <Text style={styles.quickStartText}>Date Night</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickStartButton}
              onPress={() => {
                setEventType('Casual');
                setMood('Relaxed');
              }}
            >
              <Ionicons name="cafe" size={20} color="#667eea" />
              <Text style={styles.quickStartText}>Weekend</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Generate Outfit Button */}
        <TouchableOpacity style={styles.generateButton} onPress={generateOutfit}>
          <Ionicons name="sparkles" size={24} color="white" />
          <Text style={styles.generateButtonText}>Generate My Outfit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#667eea',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wardrobeGrid: {
    gap: 8,
  },
  wardrobeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedOptionChip: {
    backgroundColor: '#667eea',
  },
  optionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedOptionText: {
    color: 'white',
  },
  generateButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickStartContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  quickStartButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  quickStartText: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '500',
  },
});