import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wardrobeService, WardrobeItem } from '../services/WardrobeService';

export default function WardrobeManagerScreen() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const CLOTHING_CATEGORIES = [
    { id: 'All', name: 'All Items', icon: 'apps', color: '#667eea' },
    { id: 'Tops', name: 'Tops', icon: 'shirt', color: '#f093fb' },
    { id: 'Bottoms', name: 'Bottoms', icon: 'pants', color: '#764ba2' },
    { id: 'Shoes', name: 'Shoes', icon: 'footsteps', color: '#f5576c' },
    { id: 'Accessories', name: 'Accessories', icon: 'watch', color: '#ff9a56' },
    { id: 'Outerwear', name: 'Outerwear', icon: 'jacket', color: '#2c3e50' }
  ];

  const COLORS = [
    { name: 'Red', hex: '#dc3545', icon: 'circle' },
    { name: 'Blue', hex: '#007bff', icon: 'circle' },
    { name: 'Green', hex: '#28a745', icon: 'circle' },
    { name: 'Yellow', hex: '#ffc107', icon: 'circle' },
    { name: 'Purple', hex: '#6f42c1', icon: 'circle' },
    { name: 'Pink', hex: '#e83e8c', icon: 'circle' },
    { name: 'Orange', hex: '#fd7e14', icon: 'circle' },
    { name: 'Brown', hex: '#8b4513', icon: 'circle' },
    { name: 'Black', hex: '#000000', icon: 'circle' },
    { name: 'White', hex: '#ffffff', icon: 'circle' },
    { name: 'Gray', hex: '#6c757d', icon: 'circle' },
    { name: 'Navy', hex: '#002868', icon: 'circle' }
  ];

  useEffect(() => {
    loadWardrobeItems();
  }, []);

  const loadWardrobeItems = async () => {
    try {
      setLoading(true);
      const items = await wardrobeService.getWardrobeItems();
      setWardrobeItems(items);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      Alert.alert('Error', 'Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWardrobeItems();
    setRefreshing(false);
  };

  // Helper function to get primary color as string for display
  const getPrimaryColor = (colors: WardrobeItem['colors']) => {
    return colors?.[0]?.primary || '';
  };

  // Helper function to get material fabric as string for display
  const getMaterialFabric = (material: WardrobeItem['material']) => {
    return material?.fabric || '';
  };

  const handleEditItem = (item: WardrobeItem) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditColor(getPrimaryColor(item.colors));
    setEditMaterial(getMaterialFabric(item.material));
    setEditSize(item.size || '');
    setEditNotes(item.notes || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    try {
      const updatedItem = {
        ...selectedItem,
        name: editName,
        colors: [{ primary: editColor }],
        material: { fabric: editMaterial },
        size: editSize,
        notes: editNotes
      };

      await wardrobeService.updateWardrobeItem(selectedItem._id!, updatedItem);
      await loadWardrobeItems();
      setEditModalVisible(false);
      Alert.alert('Success', 'Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = (item: WardrobeItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await wardrobeService.deleteWardrobeItem(item._id!);
              await loadWardrobeItems();
              Alert.alert('Success', 'Item deleted successfully!');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const getColorHex = (colorName: string) => {
    const color = COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    return color?.hex || '#667eea';
  };

  const getCategoryIcon = (category: string) => {
    const cat = CLOTHING_CATEGORIES.find(c => c.id === category);
    return cat?.icon || 'shirt';
  };

  const getCategoryColor = (category: string) => {
    const cat = CLOTHING_CATEGORIES.find(c => c.id === category);
    return cat?.color || '#667eea';
  };

  const filteredItems = filterCategory === 'All' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === filterCategory);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading your wardrobe...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>My Wardrobe</Text>
          <TouchableOpacity 
            onPress={() => router.push('/wardrobe-assessment')} 
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CLOTHING_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterButton,
                  filterCategory === category.id && styles.activeFilterButton
                ]}
                onPress={() => setFilterCategory(category.id)}
              >
                <BlurView intensity={20} tint="light" style={styles.filterBlur}>
                  <Ionicons name={category.icon as any} size={20} color="white" />
                  <Text style={styles.filterText}>{category.name}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Items Count */}
        <View style={styles.statsContainer}>
          <BlurView intensity={20} tint="light" style={styles.statsBlur}>
            <Text style={styles.statsText}>
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              {filterCategory !== 'All' && ` in ${filterCategory}`}
            </Text>
          </BlurView>
        </View>

        {/* Wardrobe Items */}
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BlurView intensity={20} tint="light" style={styles.emptyBlur}>
                <Ionicons name="shirt-outline" size={64} color="white" />
                <Text style={styles.emptyTitle}>No Items Found</Text>
                <Text style={styles.emptyText}>
                  {filterCategory === 'All' 
                    ? 'Add some clothes to your wardrobe to get started!'
                    : `No ${filterCategory.toLowerCase()} in your wardrobe yet.`
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={() => router.push('/wardrobe-assessment')}
                >
                  <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.addItemGradient}>
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addItemText}>Add Items</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </BlurView>
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {filteredItems.map((item) => (
                <View key={item._id} style={styles.itemCard}>
                  <BlurView intensity={20} tint="light" style={styles.itemBlur}>
                    {/* Item Visual */}
                    <View style={styles.itemVisual}>
                      <LinearGradient
                        colors={[getCategoryColor(item.category), getColorHex(getPrimaryColor(item.colors))]}
                        style={styles.itemIcon}
                      >
                        <Ionicons 
                          name={getCategoryIcon(item.category) as any} 
                          size={32} 
                          color="white" 
                        />
                      </LinearGradient>
                      {getPrimaryColor(item.colors) && (
                        <View 
                          style={[styles.colorDot, { backgroundColor: getColorHex(getPrimaryColor(item.colors)) }]} 
                        />
                      )}
                    </View>

                    {/* Item Info */}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      {item.size && (
                        <Text style={styles.itemSize}>Size: {item.size}</Text>
                      )}
                      {item.material && (
                        <Text style={styles.itemMaterial}>{getMaterialFabric(item.material)}</Text>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <View style={styles.occasionsContainer}>
                          {item.tags.slice(0, 2).map((tag, index) => (
                            <View key={index} style={styles.occasionTag}>
                              <Text style={styles.occasionText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.itemActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEditItem(item)}
                      >
                        <Ionicons name="pencil" size={16} color="#f093fb" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteItem(item)}
                      >
                        <Ionicons name="trash" size={16} color="#f5576c" />
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <BlurView intensity={30} tint="dark" style={styles.modalBlur}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Item</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Item name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.colorPicker}>
                        {COLORS.map((color) => (
                          <TouchableOpacity
                            key={color.name}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color.hex },
                              editColor === color.name && styles.selectedColor
                            ]}
                            onPress={() => setEditColor(color.name)}
                          >
                            {editColor === color.name && (
                              <Ionicons name="checkmark" size={16} color="white" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Material</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editMaterial}
                      onChangeText={setEditMaterial}
                      placeholder="e.g., Cotton, Denim, Wool"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Size</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editSize}
                      onChangeText={setEditSize}
                      placeholder="e.g., S, M, L, XL"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Notes</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={editNotes}
                      onChangeText={setEditNotes}
                      placeholder="Additional notes..."
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      multiline={true}
                      numberOfLines={3}
                    />
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveEdit}
                  >
                    <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.saveButtonGradient}>
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeFilterButton: {
    transform: [{ scale: 1.05 }],
  },
  filterBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyBlur: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  addItemButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  addItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsGrid: {
    gap: 16,
    paddingBottom: 20,
  },
  itemCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemBlur: {
    padding: 16,
  },
  itemVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  itemInfo: {
    flex: 1,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  itemMaterial: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  occasionsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  occasionTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  occasionText: {
    fontSize: 10,
    color: 'white',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBlur: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});