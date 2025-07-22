import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface OutfitItem {
  id?: string;
  name: string;
  category: string;
  color?: string;
  material?: string;
  isSuggestion?: boolean;
}

interface AIOutfitModelProps {
  outfit: OutfitItem[];
  eventType: string;
  mood: string;
}

export default function AIOutfitModel({ outfit, eventType, mood }: AIOutfitModelProps) {
  // Get items by category
  const getItemByCategory = (category: string) => {
    return outfit.find(item => item.category === category);
  };

  const tops = getItemByCategory('Tops');
  const bottoms = getItemByCategory('Bottoms');
  const shoes = getItemByCategory('Shoes');
  const outerwear = getItemByCategory('Outerwear');
  const accessories = getItemByCategory('Accessories');

  // Get colors for visualization
  const getItemColor = (item: OutfitItem | undefined, defaultColor: string) => {
    if (!item) return '#e0e0e0';
    if (item.color) return item.color;
    if (item.isSuggestion) return '#f5576c';
    return defaultColor;
  };

  const getOutfitMoodColors = () => {
    switch (mood.toLowerCase()) {
      case 'confident':
      case 'bold':
        return ['#f093fb', '#f5576c'];
      case 'comfortable':
      case 'relaxed':
        return ['#667eea', '#764ba2'];
      case 'elegant':
      case 'sophisticated':
        return ['#2c3e50', '#3498db'];
      case 'fun':
      case 'playful':
        return ['#ff9a56', '#ff6b9d'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getOutfitMoodColors()}
        style={styles.backgroundGradient}
      >
        {/* Model Title */}
        <View style={styles.titleContainer}>
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.title}>AI Model Preview</Text>
          <Text style={styles.subtitle}>{eventType} • {mood}</Text>
        </View>

        {/* AI Avatar */}
        <View style={styles.modelContainer}>
          {/* Head */}
          <View style={styles.head}>
            <View style={styles.face}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <View style={styles.smile} />
          </View>

          {/* Body with Clothing */}
          <View style={styles.body}>
            {/* Outerwear Layer */}
            {outerwear && (
              <View style={[styles.outerwearLayer, { backgroundColor: getItemColor(outerwear, '#2c3e50') }]}>
                <Text style={styles.itemLabel}>
                  {outerwear.isSuggestion ? '+ ' : ''}
                  {outerwear.name}
                </Text>
              </View>
            )}

            {/* Top Layer */}
            {tops && (
              <View style={[styles.topLayer, { backgroundColor: getItemColor(tops, '#3498db') }]}>
                <Text style={styles.itemLabel}>
                  {tops.isSuggestion ? '+ ' : ''}
                  {tops.name}
                </Text>
                {tops.isSuggestion && (
                  <View style={styles.suggestionBadge}>
                    <Ionicons name="add-circle" size={16} color="white" />
                  </View>
                )}
              </View>
            )}

            {/* Arms */}
            <View style={styles.arms}>
              <View style={[styles.arm, styles.leftArm]} />
              <View style={[styles.arm, styles.rightArm]} />
            </View>
          </View>

          {/* Lower Body */}
          <View style={styles.lowerBody}>
            {/* Bottoms */}
            {bottoms && (
              <View style={[styles.bottomsLayer, { backgroundColor: getItemColor(bottoms, '#34495e') }]}>
                <Text style={styles.itemLabel}>
                  {bottoms.isSuggestion ? '+ ' : ''}
                  {bottoms.name}
                </Text>
                {bottoms.isSuggestion && (
                  <View style={styles.suggestionBadge}>
                    <Ionicons name="add-circle" size={16} color="white" />
                  </View>
                )}
              </View>
            )}

            {/* Legs */}
            <View style={styles.legs}>
              <View style={styles.leg} />
              <View style={styles.leg} />
            </View>
          </View>

          {/* Shoes */}
          {shoes && (
            <View style={styles.shoesContainer}>
              <View style={[styles.shoe, { backgroundColor: getItemColor(shoes, '#2c3e50') }]}>
                <Text style={styles.shoeLabel}>
                  {shoes.isSuggestion ? '+ ' : ''}
                  {shoes.name}
                </Text>
              </View>
              <View style={[styles.shoe, { backgroundColor: getItemColor(shoes, '#2c3e50') }]} />
            </View>
          )}

          {/* Accessories */}
          {accessories && (
            <View style={styles.accessoriesContainer}>
              <View style={styles.accessory}>
                <Ionicons name="diamond" size={20} color={getItemColor(accessories, '#f39c12')} />
                <Text style={styles.accessoryLabel}>
                  {accessories.isSuggestion ? '+ ' : ''}
                  {accessories.name}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Outfit Summary */}
        <View style={styles.outfitSummary}>
          <Text style={styles.summaryTitle}>Complete Look</Text>
          <View style={styles.itemsList}>
            {outfit.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Ionicons 
                  name={item.isSuggestion ? "add-circle" : "checkmark-circle"} 
                  size={16} 
                  color={item.isSuggestion ? "#f5576c" : "#28a745"} 
                />
                <Text style={[styles.summaryText, item.isSuggestion && styles.suggestionText]}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundGradient: {
    padding: 20,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  modelContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  head: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fdbcb4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  face: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  eye: {
    width: 4,
    height: 4,
    backgroundColor: '#2c3e50',
    borderRadius: 2,
    margin: 6,
  },
  smile: {
    width: 16,
    height: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2c3e50',
    borderRadius: 8,
    position: 'absolute',
    bottom: 8,
  },
  body: {
    position: 'relative',
    alignItems: 'center',
  },
  outerwearLayer: {
    width: 120,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 3,
  },
  topLayer: {
    width: 100,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  arms: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
    position: 'absolute',
    top: 10,
    zIndex: 1,
  },
  arm: {
    width: 20,
    height: 60,
    backgroundColor: '#fdbcb4',
    borderRadius: 10,
  },
  leftArm: {
    transform: [{ rotate: '-15deg' }],
  },
  rightArm: {
    transform: [{ rotate: '15deg' }],
  },
  lowerBody: {
    alignItems: 'center',
    marginTop: 10,
  },
  bottomsLayer: {
    width: 80,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  legs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  leg: {
    width: 15,
    height: 40,
    backgroundColor: '#fdbcb4',
    borderRadius: 8,
  },
  shoesContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  shoe: {
    width: 25,
    height: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoriesContainer: {
    position: 'absolute',
    top: -80,
    right: -40,
  },
  accessory: {
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shoeLabel: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  accessoryLabel: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  suggestionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f5576c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitSummary: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemsList: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  suggestionText: {
    fontStyle: 'italic',
    opacity: 0.9,
  },
});