import * as SecureStore from 'expo-secure-store';

class SecureStorage {
  private static instance: SecureStorage;

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      // Note: SecureStore doesn't have a clear all method
      // You would need to track keys and remove them individually
      const keys = ['auth_token', 'refresh_token', 'user_data'];
      await Promise.all(keys.map(key => this.removeItem(key)));
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  }

  // Auth specific methods
  async storeAuthTokens(token: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setItem('auth_token', token),
      this.setItem('refresh_token', refreshToken)
    ]);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem('auth_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem('refresh_token');
  }

  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      this.removeItem('auth_token'),
      this.removeItem('refresh_token')
    ]);
  }

  async storeUserData(userData: string): Promise<void> {
    await this.setItem('user_data', userData);
  }

  async getUserData(): Promise<string | null> {
    return this.getItem('user_data');
  }
}

export const secureStorage = SecureStorage.getInstance();