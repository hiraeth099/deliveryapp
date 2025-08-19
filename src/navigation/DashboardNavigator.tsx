import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import MapScreen from '../screens/maps/MapScreen';
import NavigationScreen from '../screens/navigation/NavigationScreen';
import { Order } from '../types';

export type DashboardStackParamList = {
  Dashboard: undefined;
  OrderDetails: { orderId: string } | { order: Order };
  Map: { orderId: string };
  Navigation: {
    orderId: string;
    orderNumber: string;
    type: 'pickup' | 'drop' | 'route';
    pickupLocation: { latitude: number; longitude: number; address: string };
    dropLocation: { latitude: number; longitude: number; address: string };
    restaurantName?: string;
    customerName?: string;
  };
};

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
