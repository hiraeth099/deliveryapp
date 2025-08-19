import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import RatingScreen from '../screens/ratings/RatingScreen';
import { Order } from '../types';

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string } | { order: Order };
  Rating: { orderId: string; type: 'customer' | 'restaurant' };
};

const Stack = createStackNavigator<OrdersStackParamList>();

const OrdersNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
    </Stack.Navigator>
  );
};

export default OrdersNavigator;