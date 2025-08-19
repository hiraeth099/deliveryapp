import React from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { store } from '../src/store';
import AppNavigator from '../src/navigation/AppNavigator';
import { loadStoredAuth } from '../src/store/slices/authSlice';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Load stored authentication data on app start
    store.dispatch(loadStoredAuth());
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
