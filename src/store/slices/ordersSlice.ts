import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../../types';
import { ordersAPI } from '../../utils/api';

interface OrdersState {
  activeOrders: Order[];
  orderHistory: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  activeOrders: [],
  orderHistory: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchActiveOrders = createAsyncThunk(
  'orders/fetchActive',
  async () => {
    // TODO: integrate backend call here
    return await ordersAPI.getActiveOrders();
  }
);

export const fetchOrderHistory = createAsyncThunk(
  'orders/fetchHistory',
  async (filters?: { status?: OrderStatus; dateRange?: string }) => {
    // TODO: integrate backend call here
    return await ordersAPI.getOrderHistory(filters);
  }
);

export const acceptOrder = createAsyncThunk(
  'orders/accept',
  async (orderId: string) => {
    // TODO: integrate backend call here
    return await ordersAPI.acceptOrder(orderId);
  }
);

export const rejectOrder = createAsyncThunk(
  'orders/reject',
  async (data: { orderId: string; reason: string }) => {
    // TODO: integrate backend call here
    return await ordersAPI.rejectOrder(data.orderId, data.reason);
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async (data: { orderId: string; status: OrderStatus; location?: { latitude: number; longitude: number } }) => {
    // TODO: integrate backend call here
    return await ordersAPI.updateOrderStatus(data.orderId, data.status, data.location);
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addNewOrder: (state, action: PayloadAction<Order>) => {
      // Real-time order assignment
      state.activeOrders.unshift(action.payload);
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.activeOrders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.activeOrders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active orders
      .addCase(fetchActiveOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.activeOrders = action.payload.data || [];
        }
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Fetch order history
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.orderHistory = action.payload.data || [];
        }
      })
      // Accept order
      .addCase(acceptOrder.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const order = action.payload.data;
          const index = state.activeOrders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            state.activeOrders[index] = order;
          }
          state.currentOrder = order;
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const updatedOrder = action.payload.data;
          const index = state.activeOrders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            state.activeOrders[index] = updatedOrder;
          }
          if (state.currentOrder?.id === updatedOrder.id) {
            state.currentOrder = updatedOrder;
          }
        }
      });
  },
});

export const { setCurrentOrder, clearError, addNewOrder, updateOrderInList } = ordersSlice.actions;
export default ordersSlice.reducer;