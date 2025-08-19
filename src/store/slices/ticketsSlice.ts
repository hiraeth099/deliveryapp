import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Ticket } from '../../types';
import { ticketsAPI } from '../../utils/api';

interface TicketsState {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async () => {
    // TODO: integrate backend call here
    return await ticketsAPI.getAllTickets();
  }
);

export const createTicket = createAsyncThunk(
  'tickets/create',
  async (ticketData: {
    title: string;
    description: string;
    category: string;
    images?: string[];
  }) => {
    // TODO: integrate backend call here
    return await ticketsAPI.createTicket(ticketData);
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/update',
  async (data: { ticketId: string; message: string; images?: string[] }) => {
    // TODO: integrate backend call here
    return await ticketsAPI.updateTicket(data.ticketId, data.message, data.images);
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.tickets = action.payload.data || [];
        }
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tickets';
      })
      // Create ticket
      .addCase(createTicket.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          state.tickets.unshift(action.payload.data);
        }
      })
      // Update ticket
      .addCase(updateTicket.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          const index = state.tickets.findIndex(t => t.id === action.payload.data?.id);
          if (index !== -1) {
            state.tickets[index] = action.payload.data;
          }
        }
      });
  },
});

export const { clearError } = ticketsSlice.actions;
export default ticketsSlice.reducer;