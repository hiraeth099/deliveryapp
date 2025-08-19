import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TicketsListScreen from '../screens/tickets/TicketsListScreen';
import TicketDetailsScreen from '../screens/tickets/TicketDetailsScreen';
import CreateTicketScreen from '../screens/tickets/CreateTicketScreen';

export type TicketsStackParamList = {
  TicketsList: undefined;
  TicketDetails: { ticketId: string };
  CreateTicket: undefined;
};

const Stack = createStackNavigator<TicketsStackParamList>();

const TicketsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TicketsList" component={TicketsListScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
    </Stack.Navigator>
  );
};

export default TicketsNavigator;