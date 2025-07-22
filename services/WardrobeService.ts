import { API_BASE_URL } from '../config/api';

export interface WardrobeItem {
  _id?: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  style?: string;
  colors: {
    primary: string;
    secondary?: string;
    pattern?: string;
  }[];
  material?: {
    fabric?: string;
    texture?: string;
    careInstructions?: string;
  };
  size?: string;
  fit?: string;
  season?: string[];
  weather?: string[];
  images?: {
    url: string;
    isPrimary?: boolean;
    caption?: string;
  }[];
  purchase?: {
    brand?: string;
    store?: string;
    price?: number;
    currency?: string;
    purchaseDate?: Date;
    isGift?: boolean;
  };
  usage?: {
    timesWorn: number;
    lastWorn?: Date;
    totalOutfits: number;
    favoriteCount: number;
  };
  tags?: string[];
  isActive?: boolean;
  condition?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WardrobeFilters {
  category?: string;
  season?: string;
  style?: string;
  search?: string;
}

export interface WardrobeStats {
  totalItems: number;
  itemsByCategory: { _id: string; count: number }[];
  mostWorn: WardrobeItem[];
  unused: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

class WardrobeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/wardrobe`;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // TODO: Implement proper auth token retrieval
    // For now, return empty headers - update when auth is implemented
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getWardrobeItems(filters?: WardrobeFilters): Promise<WardrobeItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const result = await this.handleResponse<WardrobeItem[]>(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      throw error;
    }
  }

  async addWardrobeItem(item: Omit<WardrobeItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<WardrobeItem> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(item),
      });

      const result = await this.handleResponse<WardrobeItem>(response);
      return result.data;
    } catch (error) {
      console.error('Error adding wardrobe item:', error);
      throw error;
    }
  }

  async updateWardrobeItem(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const result = await this.handleResponse<WardrobeItem>(response);
      return result.data;
    } catch (error) {
      console.error('Error updating wardrobe item:', error);
      throw error;
    }
  }

  async deleteWardrobeItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      await this.handleResponse<void>(response);
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      throw error;
    }
  }

  async getWardrobeItem(id: string): Promise<WardrobeItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const result = await this.handleResponse<WardrobeItem>(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching wardrobe item:', error);
      throw error;
    }
  }

  async updateItemUsage(id: string, action: 'wear' | 'outfit' | 'favorite' | 'unfavorite'): Promise<WardrobeItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/usage`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ action }),
      });

      const result = await this.handleResponse<WardrobeItem>(response);
      return result.data;
    } catch (error) {
      console.error('Error updating item usage:', error);
      throw error;
    }
  }

  async getWardrobeStats(): Promise<WardrobeStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const result = await this.handleResponse<WardrobeStats>(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching wardrobe stats:', error);
      throw error;
    }
  }

  // Utility methods for client-side operations
  filterItemsByCategory(items: WardrobeItem[], category: string): WardrobeItem[] {
    return items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  searchItems(items: WardrobeItem[], query: string): WardrobeItem[] {
    const searchQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery)) ||
      item.purchase?.brand?.toLowerCase().includes(searchQuery)
    );
  }

  getItemsByColors(items: WardrobeItem[], colors: string[]): WardrobeItem[] {
    return items.filter(item => 
      item.colors.some(color => 
        colors.some(searchColor => 
          color.primary.toLowerCase().includes(searchColor.toLowerCase())
        )
      )
    );
  }

  getItemsBySeason(items: WardrobeItem[], season: string): WardrobeItem[] {
    return items.filter(item => 
      item.season?.includes(season) || item.season?.includes('all-season')
    );
  }
}

export const wardrobeService = new WardrobeService();
export default wardrobeService;