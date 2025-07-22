import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WardrobeItem } from '../services/WardrobeService';

const { width, height } = Dimensions.get('window');

interface AddClothingModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: Omit<WardrobeItem, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  preselectedCategory?: string;
}

const CATEGORIES = [
  { id: 'Tops', name: 'Tops', icon: 'shirt-outline' },
  { id: 'Bottoms', name: 'Bottoms', icon: 'fitness-outline' },
  { id: 'Dresses', name: 'Dresses', icon: 'woman-outline' },
  { id: 'Shoes', name: 'Shoes', icon: 'footsteps-outline' },
  { id: 'Accessories', name: 'Accessories', icon: 'diamond-outline' },
  { id: 'Outerwear', name: 'Outerwear', icon: 'snow-outline' },
];

const COLORS = [
  'black', 'white', 'gray', 'brown', 'red', 'pink', 'orange', 
  'yellow', 'green', 'blue', 'purple', 'navy', 'beige', 'gold', 'silver'
];

const FABRICS = [
  'cotton', 'polyester', 'wool', 'silk', 'linen', 'denim', 
  'leather', 'synthetic', 'blend'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'];

const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all-season'];

const STYLES = ['casual', 'formal', 'business', 'party', 'athletic', 'loungewear', 'trendy', 'classic'];

export default function AddClothingModal({ 
  visible, 
  onClose, 
  onAdd, 
  preselectedCategory 
}: AddClothingModalProps) {
  const [formData, setFormData] = useState<Partial<WardrobeItem>>({
    name: '',
    category: preselectedCategory || '',
    description: '',
    colors: [{ primary: '' }],
    material: { fabric: '' },
    size: '',
    season: [],
    style: '',
    tags: [],
    images: [],
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  const resetForm = () => {
    setFormData({
      name: '',
      category: preselectedCategory || '',
      description: '',
      colors: [{ primary: '' }],
      material: { fabric: '' },
      size: '',
      season: [],
      style: '',
      tags: [],
      images: [],
    });
    setCurrentStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = {
          url: result.assets[0].uri,
          isPrimary: formData.images?.length === 0,
        };
        
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), newImage]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = {
          url: result.assets[0].uri,
          isPrimary: formData.images?.length === 0,
        };
        
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), newImage]
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.colors?.[0]?.primary) {
      Alert.alert('Missing Information', 'Please fill in all required fields (name, category, and color).');
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData as Omit<WardrobeItem, '_id' | 'createdAt' | 'updatedAt'>);
      handleClose();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add clothing item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[0, 1, 2].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            currentStep >= step && styles.stepDotActive
          ]}
        />
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Item Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., White Button-Down Shirt"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                formData.category === category.id && styles.categoryChipSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={formData.category === category.id ? 'white' : '#667eea'} 
              />
              <Text style={[
                styles.categoryChipText,
                formData.category === category.id && styles.categoryChipTextSelected
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief description of the item..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Details & Attributes</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Primary Color *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorChip,
                { backgroundColor: color === 'white' ? '#f8f9fa' : color },
                formData.colors?.[0]?.primary === color && styles.colorChipSelected
              ]}
              onPress={() => setFormData(prev => ({
                ...prev,
                colors: [{ primary: color }]
              }))}
            >
              {formData.colors?.[0]?.primary === color && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fabric</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FABRICS.map((fabric) => (
            <TouchableOpacity
              key={fabric}
              style={[
                styles.chip,
                formData.material?.fabric === fabric && styles.chipSelected
              ]}
              onPress={() => setFormData(prev => ({
                ...prev,
                material: { ...prev.material, fabric }
              }))}
            >
              <Text style={[
                styles.chipText,
                formData.material?.fabric === fabric && styles.chipTextSelected
              ]}>
                {fabric}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Size</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.chip,
                formData.size === size && styles.chipSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, size }))}
            >
              <Text style={[
                styles.chipText,
                formData.size === size && styles.chipTextSelected
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STYLES.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.chip,
                formData.style === style && styles.chipSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, style }))}
            >
              <Text style={[
                styles.chipText,
                formData.style === style && styles.chipTextSelected
              ]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Season</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SEASONS.map((season) => (
            <TouchableOpacity
              key={season}
              style={[
                styles.chip,
                formData.season?.includes(season) && styles.chipSelected
              ]}
              onPress={() => {
                const currentSeasons = formData.season || [];
                const newSeasons = currentSeasons.includes(season)
                  ? currentSeasons.filter(s => s !== season)
                  : [...currentSeasons, season];
                setFormData(prev => ({ ...prev, season: newSeasons }));
              }}
            >
              <Text style={[
                styles.chipText,
                formData.season?.includes(season) && styles.chipTextSelected
              ]}>
                {season}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderPhotos = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add Photos</Text>
      <Text style={styles.stepSubtitle}>Photos help generate better outfit recommendations</Text>
      
      <View style={styles.photoSection}>
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.photoButtonGradient}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.photoButtonGradient}>
              <Ionicons name="images" size={24} color="white" />
              <Text style={styles.photoButtonText}>Choose from Gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {formData.images && formData.images.length > 0 && (
          <View style={styles.photoPreview}>
            <Text style={styles.label}>Photos ({formData.images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.previewImageContainer}>
                  <Image source={{ uri: image.url }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData(prev => ({
                      ...prev,
                      images: prev.images?.filter((_, i) => i !== index)
                    }))}
                  >
                    <Ionicons name="close-circle" size={20} color="#f5576c" />
                  </TouchableOpacity>
                  {image.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderDetails();
      case 2:
        return renderPhotos();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Add Clothing Item</Text>
              <View style={styles.placeholder} />
            </View>

            {renderStepIndicator()}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {renderCurrentStep()}
            </ScrollView>

            <View style={styles.footer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setCurrentStep(prev => prev - 1)}
                >
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, { flex: currentStep === 0 ? 1 : 0.7 }]}
                onPress={currentStep === 2 ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <Text style={styles.primaryButtonText}>Adding...</Text>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        {currentStep === 2 ? 'Add Item' : 'Next'}
                      </Text>
                      <Ionicons 
                        name={currentStep === 2 ? "checkmark" : "arrow-forward"} 
                        size={20} 
                        color="white" 
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBlur: {
    height: height * 0.9,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#f093fb',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryChipText: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  colorScroll: {
    flexDirection: 'row',
  },
  colorChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipSelected: {
    borderColor: 'white',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipSelected: {
    backgroundColor: '#f093fb',
    borderColor: '#f093fb',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  photoSection: {
    marginTop: 10,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  photoPreview: {
    marginTop: 10,
  },
  previewImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#f093fb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  secondaryButton: {
    flex: 0.3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});