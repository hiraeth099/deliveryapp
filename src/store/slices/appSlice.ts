import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark';
  language: 'en' | 'hi' | 'te';
  isOnline: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const initialState: AppState = {
  theme: 'light',
  language: 'en',
  isOnline: false,
  currentLocation: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'hi' | 'te'>) => {
      state.language = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setCurrentLocation: (state, action: PayloadAction<{ latitude: number; longitude: number } | null>) => {
      state.currentLocation = action.payload;
    },
  },
});

export const { setTheme, setLanguage, setOnlineStatus, setCurrentLocation } = appSlice.actions;
export default appSlice.reducer;