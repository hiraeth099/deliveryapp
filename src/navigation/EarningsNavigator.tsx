import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import TransactionsScreen from '../screens/earnings/TransactionsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';

export type EarningsStackParamList = {
  Earnings: undefined;
  Transactions: undefined;
  Wallet: undefined;
};

const Stack = createStackNavigator<EarningsStackParamList>();

const EarningsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
    </Stack.Navigator>
  );
};

export default EarningsNavigator;