import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import ordersSlice from './slices/ordersSlice';
import earningsSlice from './slices/earningsSlice';
import ticketsSlice from './slices/ticketsSlice';
import appSlice from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: ordersSlice,
    earnings: earningsSlice,
    tickets: ticketsSlice,
    app: appSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;