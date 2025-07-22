import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
}

const CATEGORIES = [
  { id: 'tops', name: 'Tops', icon: 'shirt-outline' },
  { id: 'bottoms', name: 'Bottoms', icon: 'fitness-outline' },
  { id: 'dresses', name: 'Dresses', icon: 'woman-outline' },
];

const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White'];

export default function DebugWardrobe() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemColor, setItemColor] = useState('');

  const addItem = () => {
    console.log('Adding item:', { itemName, itemColor, selectedCategory });
    
    if (!itemName || !itemColor || !selectedCategory) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newItem: WardrobeItem = {
      id: Date.now().toString(),
      name: itemName,
      category: selectedCategory,
      color: itemColor,
    };

    setWardrobeItems(prev => [...prev, newItem]);
    setItemName('');
    setItemColor('');
    setSelectedCategory('');
    setIsModalVisible(false);
    
    Alert.alert('Success', 'Item added!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug Wardrobe</Text>
      </View>

      <Text style={styles.subtitle}>Items: {wardrobeItems.length}</Text>

      <ScrollView>
        <Text style={styles.sectionTitle}>Categories</Text>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryButton}
            onPress={() => {
              console.log('Category pressed:', category.name);
              setSelectedCategory(category.id);
              setIsModalVisible(true);
            }}
          >
            <Ionicons name={category.icon} size={24} color="blue" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Your Items</Text>
        {wardrobeItems.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>{item.color} - {item.category}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="Enter item name"
            />

            <Text style={styles.label}>Color</Text>
            <ScrollView horizontal style={styles.colorContainer}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    itemColor === color && styles.selectedColor
                  ]}
                  onPress={() => setItemColor(color)}
                >
                  <Text style={styles.colorText}>{color}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: 'gray',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 16,
    marginLeft: 10,
  },
  itemCard: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    borderRadius: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: 'blue',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  colorContainer: {
    marginBottom: 30,
  },
  colorButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderRadius: 5,
  },
  selectedColor: {
    backgroundColor: 'blue',
  },
  colorText: {
    fontSize: 14,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});