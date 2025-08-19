import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Earnings, Wallet } from '../../types';
import { earningsAPI } from '../../utils/api';

interface EarningsState {
  wallet: Wallet;
  transactions: Earnings[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EarningsState = {
  wallet: {
    balance: 0,
    pendingAmount: 0,
    totalEarnings: 0,
    cashInHand: 0,
  },
  transactions: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWalletData = createAsyncThunk(
  'earnings/fetchWallet',
  async () => {
    // TODO: integrate backend call here
    return await earningsAPI.getWalletData();
  }
);

export const fetchTransactions = createAsyncThunk(
  'earnings/fetchTransactions',
  async (filters?: { period?: 'daily' | 'weekly' | 'monthly'; startDate?: string; endDate?: string }) => {
    // TODO: integrate backend call here
    return await earningsAPI.getTransactions(filters);
  }
);

export const requestPayout = createAsyncThunk(
  'earnings/requestPayout',
  async (amount: number) => {
    // TODO: integrate backend call here
    return await earningsAPI.requestPayout(amount);
  }
);

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addEarning: (state, action) => {
      // Real-time earning update
      state.transactions.unshift(action.payload);
      state.wallet.totalEarnings += action.payload.amount;
      if (action.payload.paymentMethod === 'cash') {
        state.wallet.cashInHand += action.payload.amount;
      } else {
        state.wallet.balance += action.payload.amount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wallet data
      .addCase(fetchWalletData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.wallet = action.payload.data || state.wallet;
        }
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch wallet data';
      })
      // Fetch transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.transactions = action.payload.data || [];
        }
      })
      // Request payout
      .addCase(requestPayout.fulfilled, (state, action) => {
        if (action.payload.success) {
          // Update wallet balance after payout request
          state.wallet.pendingAmount = (action.payload.data?.pendingAmount) || state.wallet.pendingAmount;
        }
      });
  },
});

export const { clearError, addEarning } = earningsSlice.actions;
export default earningsSlice.reducer;