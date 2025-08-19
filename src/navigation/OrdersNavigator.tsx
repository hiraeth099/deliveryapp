import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import RatingScreen from '../screens/ratings/RatingScreen';
import NavigationScreen from '../screens/navigation/NavigationScreen';
import { Order } from '../types';

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string } | { order: Order };
  Rating: { orderId: string; type: 'customer' | 'restaurant' };
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

const Stack = createStackNavigator<OrdersStackParamList>();

const OrdersNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
    </Stack.Navigator>
  );
};

export default OrdersNavigator;