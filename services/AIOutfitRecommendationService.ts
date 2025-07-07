export interface ClothingItem {
  id: string;
  name: string;
  category: string;
}

export interface OutfitRecommendation {
  id: string;
  items: ClothingItem[];
  score: number;
  reasoning: string;
  styleNotes: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

export interface UserPreferences {
  eventType: string;
  mood: string;
  seasonality?: string;
  colorPreference?: string;
}

export class AIOutfitRecommendationService {
  private readonly OUTFIT_COMBINATIONS = {
    Work: {
      required: ['Tops', 'Bottoms'],
      optional: ['Outerwear', 'Shoes', 'Accessories'],
      excludes: ['Casual wear', 'Athletic wear']
    },
    Casual: {
      required: ['Tops'],
      optional: ['Bottoms', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['Formal wear']
    },
    'Date Night': {
      required: ['Tops', 'Bottoms'],
      optional: ['Dresses', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['Athletic wear', 'Loungewear']
    },
    Party: {
      required: ['Tops'],
      optional: ['Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['Work wear', 'Athletic wear']
    },
    Formal: {
      required: ['Tops', 'Bottoms'],
      optional: ['Dresses', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['Casual wear', 'Athletic wear']
    },
    Exercise: {
      required: ['Tops', 'Bottoms'],
      optional: ['Outerwear', 'Shoes'],
      excludes: ['Formal wear', 'Delicate fabrics']
    }
  };

  private readonly MOOD_STYLES = {
    Confident: {
      keywords: ['bold', 'structured', 'statement', 'sharp', 'commanding'],
      colors: ['black', 'red', 'navy', 'white'],
      avoid: ['oversized', 'muted', 'casual']
    },
    Comfortable: {
      keywords: ['soft', 'relaxed', 'cozy', 'loose', 'breathable'],
      colors: ['neutral', 'earth tones', 'pastels'],
      avoid: ['tight', 'restrictive', 'formal']
    },
    Trendy: {
      keywords: ['current', 'fashionable', 'stylish', 'contemporary', 'chic'],
      colors: ['seasonal', 'on-trend', 'modern'],
      avoid: ['outdated', 'basic', 'old-fashioned']
    },
    Classic: {
      keywords: ['timeless', 'elegant', 'refined', 'sophisticated', 'traditional'],
      colors: ['neutral', 'black', 'white', 'navy', 'beige'],
      avoid: ['trendy', 'flashy', 'experimental']
    },
    Bold: {
      keywords: ['vibrant', 'daring', 'eye-catching', 'unique', 'adventurous'],
      colors: ['bright', 'contrasting', 'neon', 'metallic'],
      avoid: ['subtle', 'muted', 'conservative']
    },
    Relaxed: {
      keywords: ['easygoing', 'casual', 'comfortable', 'laid-back', 'effortless'],
      colors: ['soft', 'muted', 'neutral'],
      avoid: ['formal', 'structured', 'complicated']
    }
  };

  private readonly STYLING_RULES = [
    {
      condition: (items: ClothingItem[], prefs: UserPreferences) => 
        prefs.eventType === 'Work' && prefs.mood === 'Confident',
      advice: 'Layer a structured blazer for authority and add a statement accessory'
    },
    {
      condition: (items: ClothingItem[], prefs: UserPreferences) => 
        prefs.eventType === 'Date Night' && prefs.mood === 'Bold',
      advice: 'Choose one statement piece as your focal point and keep other items complementary'
    },
    {
      condition: (items: ClothingItem[], prefs: UserPreferences) => 
        prefs.eventType === 'Casual' && prefs.mood === 'Comfortable',
      advice: 'Opt for soft fabrics and relaxed fits that allow for easy movement'
    },
    {
      condition: (items: ClothingItem[], prefs: UserPreferences) => 
        prefs.eventType === 'Party' && prefs.mood === 'Trendy',
      advice: 'Mix textures and add eye-catching accessories to elevate your look'
    },
    {
      condition: (items: ClothingItem[], prefs: UserPreferences) => 
        prefs.eventType === 'Formal' && prefs.mood === 'Classic',
      advice: 'Stick to neutral colors and timeless silhouettes for an elegant appearance'
    }
  ];

  /**
   * Generates outfit recommendations based on user preferences and wardrobe
   */
  public generateOutfitRecommendations(
    wardrobe: ClothingItem[],
    preferences: UserPreferences
  ): OutfitRecommendation[] {
    const recommendations: OutfitRecommendation[] = [];
    
    // Group items by category
    const itemsByCategory = this.groupItemsByCategory(wardrobe);
    
    // Generate multiple outfit combinations
    const combinations = this.generateCombinations(itemsByCategory, preferences);
    
    // Score and rank each combination
    combinations.forEach((combo, index) => {
      const score = this.calculateOutfitScore(combo, preferences);
      const reasoning = this.generateReasoning(combo, preferences);
      const styleNotes = this.generateStyleNotes(combo, preferences);
      const confidenceLevel = this.calculateConfidenceLevel(score, combo.length);
      
      recommendations.push({
        id: `outfit-${index + 1}`,
        items: combo,
        score,
        reasoning,
        styleNotes,
        confidenceLevel
      });
    });
    
    // Sort by score (highest first) and return top 3
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  private groupItemsByCategory(items: ClothingItem[]): Map<string, ClothingItem[]> {
    const grouped = new Map<string, ClothingItem[]>();
    
    items.forEach(item => {
      const category = item.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });
    
    return grouped;
  }

  private generateCombinations(
    itemsByCategory: Map<string, ClothingItem[]>,
    preferences: UserPreferences
  ): ClothingItem[][] {
    const combinations: ClothingItem[][] = [];
    const eventRules = this.OUTFIT_COMBINATIONS[preferences.eventType as keyof typeof this.OUTFIT_COMBINATIONS];
    
    if (!eventRules) return combinations;
    
    // Generate up to 5 different combinations
    for (let i = 0; i < 5; i++) {
      const combination: ClothingItem[] = [];
      
      // Add required items
      eventRules.required.forEach(category => {
        const items = itemsByCategory.get(category) || [];
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          combination.push(randomItem);
        }
      });
      
      // Add optional items (randomly)
      eventRules.optional.forEach(category => {
        const items = itemsByCategory.get(category) || [];
        if (items.length > 0 && Math.random() > 0.5) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          combination.push(randomItem);
        }
      });
      
      if (combination.length >= 2) {
        combinations.push(combination);
      }
    }
    
    return combinations;
  }

  private calculateOutfitScore(items: ClothingItem[], preferences: UserPreferences): number {
    let score = 0;
    
    // Base score for having items
    score += items.length * 10;
    
    // Event type compatibility
    const eventRules = this.OUTFIT_COMBINATIONS[preferences.eventType as keyof typeof this.OUTFIT_COMBINATIONS];
    if (eventRules) {
      // Check if required categories are present
      const categories = items.map(item => item.category);
      const hasAllRequired = eventRules.required.every(cat => categories.includes(cat));
      score += hasAllRequired ? 30 : -20;
    }
    
    // Mood compatibility - analyze item names for mood keywords
    const moodStyle = this.MOOD_STYLES[preferences.mood as keyof typeof this.MOOD_STYLES];
    if (moodStyle) {
      items.forEach(item => {
        const itemName = item.name.toLowerCase();
        const hasPositiveKeywords = moodStyle.keywords.some(keyword => 
          itemName.includes(keyword.toLowerCase())
        );
        const hasNegativeKeywords = moodStyle.avoid.some(keyword => 
          itemName.includes(keyword.toLowerCase())
        );
        
        if (hasPositiveKeywords) score += 15;
        if (hasNegativeKeywords) score -= 10;
      });
    }
    
    // Bonus for variety in categories
    const uniqueCategories = new Set(items.map(item => item.category));
    score += uniqueCategories.size * 5;
    
    return Math.max(0, score);
  }

  private generateReasoning(items: ClothingItem[], preferences: UserPreferences): string {
    const categories = items.map(item => item.category);
    const eventType = preferences.eventType.toLowerCase();
    const mood = preferences.mood.toLowerCase();
    
    const reasons = [
      `This outfit combines ${categories.join(', ')} perfectly for a ${eventType} occasion.`,
      `The ${mood} mood is reflected in the choice of ${items[0].name} as the focal point.`,
      `This combination balances style and comfort for your ${eventType} event.`
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private generateStyleNotes(items: ClothingItem[], preferences: UserPreferences): string[] {
    const notes: string[] = [];
    
    // Add relevant styling rule
    const applicableRule = this.STYLING_RULES.find(rule => 
      rule.condition(items, preferences)
    );
    if (applicableRule) {
      notes.push(applicableRule.advice);
    }
    
    // Add general styling tips
    const moodStyle = this.MOOD_STYLES[preferences.mood as keyof typeof this.MOOD_STYLES];
    if (moodStyle) {
      notes.push(`For a ${preferences.mood.toLowerCase()} look, focus on ${moodStyle.keywords.slice(0, 2).join(' and ')} elements.`);
    }
    
    // Add accessory suggestions
    const hasAccessories = items.some(item => item.category === 'Accessories');
    if (!hasAccessories) {
      notes.push('Consider adding accessories to complete the look.');
    }
    
    return notes;
  }

  private calculateConfidenceLevel(score: number, itemCount: number): 'High' | 'Medium' | 'Low' {
    if (score >= 80 && itemCount >= 3) return 'High';
    if (score >= 50 && itemCount >= 2) return 'Medium';
    return 'Low';
  }

  /**
   * Analyzes wardrobe gaps and suggests items to add
   */
  public analyzeWardrobeGaps(wardrobe: ClothingItem[]): string[] {
    const categories = new Set(wardrobe.map(item => item.category));
    const suggestions: string[] = [];
    
    const essentialCategories = ['Tops', 'Bottoms', 'Shoes'];
    const versatileCategories = ['Outerwear', 'Accessories', 'Dresses'];
    
    essentialCategories.forEach(category => {
      if (!categories.has(category)) {
        suggestions.push(`Add ${category.toLowerCase()} to build a foundation wardrobe`);
      }
    });
    
    versatileCategories.forEach(category => {
      if (!categories.has(category)) {
        suggestions.push(`Consider adding ${category.toLowerCase()} for more outfit variety`);
      }
    });
    
    return suggestions;
  }
}

// Singleton instance
export const aiOutfitService = new AIOutfitRecommendationService();