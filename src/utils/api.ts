import { ApiResponse, Order, User, Earnings, Wallet, Ticket, OrderStatus } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Auth API methods
  async login(credentials: { email: string; password: string }) {
    // TODO: integrate backend call here
    return this.request<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyOTP(data: { phone: string; otp: string }) {
    // TODO: integrate backend call here
    return this.request<{ user: User; token: string; refreshToken: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendOTP(phone: string) {
    // TODO: integrate backend call here
    return this.request<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async refreshToken(refreshToken: string) {
    // TODO: integrate backend call here
    return this.request<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    // TODO: integrate backend call here
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async forgotPassword(email: string) {
    // TODO: integrate backend call here
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Orders API methods
  async getActiveOrders() {
    // TODO: integrate backend call here
    return this.request<Order[]>('/orders/active');
  }

  async getOrderHistory(filters?: { status?: OrderStatus; dateRange?: string }) {
    // TODO: integrate backend call here
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.dateRange) queryParams.append('dateRange', filters.dateRange);
    
    return this.request<Order[]>(`/orders/history?${queryParams}`);
  }

  async acceptOrder(orderId: string) {
    // TODO: integrate backend call here
    return this.request<Order>(`/orders/${orderId}/accept`, {
      method: 'POST',
    });
  }

  async rejectOrder(orderId: string, reason: string) {
    // TODO: integrate backend call here
    return this.request(`/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, location?: { latitude: number; longitude: number }) {
    // TODO: integrate backend call here
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, location }),
    });
  }

  // Earnings API methods
  async getWalletData() {
    // TODO: integrate backend call here
    return this.request<Wallet>('/earnings/wallet');
  }

  async getTransactions(filters?: { period?: string; startDate?: string; endDate?: string }) {
    // TODO: integrate backend call here
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    
    return this.request<Earnings[]>(`/earnings/transactions?${queryParams}`);
  }

  async requestPayout(amount: number) {
    // TODO: integrate backend call here
    return this.request('/earnings/payout', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Tickets API methods
  async getAllTickets() {
    // TODO: integrate backend call here
    return this.request<Ticket[]>('/tickets');
  }

  async createTicket(ticketData: { title: string; description: string; category: string; images?: string[] }) {
    // TODO: integrate backend call here
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(ticketId: string, message: string, images?: string[]) {
    // TODO: integrate backend call here
    return this.request<Ticket>(`/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify({ message, images }),
    });
  }

  // Profile API methods
  async updateProfile(profileData: Partial<User>) {
    // TODO: integrate backend call here
    return this.request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadDocument(documentType: string, file: FormData) {
    // TODO: integrate backend call here
    return this.request(`/profile/documents/${documentType}`, {
      method: 'POST',
      body: file,
      headers: {}, // Let fetch set content-type for FormData
    });
  }

  // Ratings API methods
  async submitRating(orderId: string, rating: number, feedback: string, type: 'customer' | 'restaurant') {
    // TODO: integrate backend call here
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify({ orderId, rating, feedback, type }),
    });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Export specific API modules for better organization
export const authAPI = {
  login: apiClient.login.bind(apiClient),
  verifyOTP: apiClient.verifyOTP.bind(apiClient),
  sendOTP: apiClient.sendOTP.bind(apiClient),
  refreshToken: apiClient.refreshToken.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  forgotPassword: apiClient.forgotPassword.bind(apiClient),
};

export const ordersAPI = {
  getActiveOrders: apiClient.getActiveOrders.bind(apiClient),
  getOrderHistory: apiClient.getOrderHistory.bind(apiClient),
  acceptOrder: apiClient.acceptOrder.bind(apiClient),
  rejectOrder: apiClient.rejectOrder.bind(apiClient),
  updateOrderStatus: apiClient.updateOrderStatus.bind(apiClient),
};

export const earningsAPI = {
  getWalletData: apiClient.getWalletData.bind(apiClient),
  getTransactions: apiClient.getTransactions.bind(apiClient),
  requestPayout: apiClient.requestPayout.bind(apiClient),
};

export const ticketsAPI = {
  getAllTickets: apiClient.getAllTickets.bind(apiClient),
  createTicket: apiClient.createTicket.bind(apiClient),
  updateTicket: apiClient.updateTicket.bind(apiClient),
};

export const profileAPI = {
  updateProfile: apiClient.updateProfile.bind(apiClient),
  uploadDocument: apiClient.uploadDocument.bind(apiClient),
};

export const ratingsAPI = {
  submitRating: apiClient.submitRating.bind(apiClient),
};

export default apiClient;