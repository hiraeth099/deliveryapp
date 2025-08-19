import AsyncStorage from '@react-native-async-storage/async-storage';

interface RejectedOrdersData {
  date: string;
  orderIds: string[];
}

const REJECTED_ORDERS_KEY = 'rejected_orders';

export class RejectedOrdersStorage {
  private static instance: RejectedOrdersStorage;

  static getInstance(): RejectedOrdersStorage {
    if (!RejectedOrdersStorage.instance) {
      RejectedOrdersStorage.instance = new RejectedOrdersStorage();
    }
    return RejectedOrdersStorage.instance;
  }

  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private isDateOlderThan3Days(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  }

  async addRejectedOrder(orderId: string): Promise<void> {
    try {
      console.log('🚫 Adding rejected order:', orderId);
      
      const currentDate = this.getCurrentDateString();
      const existingData = await this.getRejectedOrdersData();
      
      let rejectedData: RejectedOrdersData;
      
      if (existingData && existingData.date === currentDate) {
        // Same day, add to existing list
        rejectedData = {
          date: currentDate,
          orderIds: [...new Set([...existingData.orderIds, orderId])] // Remove duplicates
        };
      } else {
        // New day or no existing data, create new record
        rejectedData = {
          date: currentDate,
          orderIds: [orderId]
        };
      }
      
      await AsyncStorage.setItem(REJECTED_ORDERS_KEY, JSON.stringify(rejectedData));
      console.log('✅ Rejected order stored successfully:', rejectedData);
      
    } catch (error) {
      console.error('🚨 Error storing rejected order:', error);
    }
  }

  async getRejectedOrderIds(): Promise<string[]> {
    try {
      const data = await this.getRejectedOrdersData();
      
      if (!data) {
        return [];
      }
      
      // Check if data is older than 3 days
      if (this.isDateOlderThan3Days(data.date)) {
        console.log('🗑️ Rejected orders data is older than 3 days, clearing...');
        await this.clearRejectedOrders();
        return [];
      }
      
      console.log('📋 Retrieved rejected order IDs:', data.orderIds);
      return data.orderIds;
      
    } catch (error) {
      console.error('🚨 Error retrieving rejected orders:', error);
      return [];
    }
  }

  private async getRejectedOrdersData(): Promise<RejectedOrdersData | null> {
    try {
      const data = await AsyncStorage.getItem(REJECTED_ORDERS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('🚨 Error parsing rejected orders data:', error);
      return null;
    }
  }

  async clearRejectedOrders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REJECTED_ORDERS_KEY);
      console.log('🗑️ Rejected orders cleared');
    } catch (error) {
      console.error('🚨 Error clearing rejected orders:', error);
    }
  }

  async cleanupOldRejectedOrders(): Promise<void> {
    try {
      const data = await this.getRejectedOrdersData();
      
      if (data && this.isDateOlderThan3Days(data.date)) {
        console.log('🧹 Cleaning up old rejected orders from:', data.date);
        await this.clearRejectedOrders();
      }
      
    } catch (error) {
      console.error('🚨 Error during cleanup:', error);
    }
  }

  // Method to check if an order is rejected
  async isOrderRejected(orderId: string): Promise<boolean> {
    const rejectedIds = await this.getRejectedOrderIds();
    return rejectedIds.includes(orderId);
  }
}

export const rejectedOrdersStorage = RejectedOrdersStorage.getInstance();