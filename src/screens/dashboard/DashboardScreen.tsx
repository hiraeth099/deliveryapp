import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Switch, ViewStyle, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { DashboardStackParamList } from '../../navigation/DashboardNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { fetchWalletData } from '../../store/slices/earningsSlice';
import { setOnlineStatus } from '../../store/slices/appSlice';
import { formatCurrency, formatOrderStatus, getOrderStatusColor, calculateEarnings } from '../../utils/formatters';
import { GetOrderByUser } from '../../utils/getapi';
import { Order } from '../../types';
import { secureStorage } from '../../storage/secureStorage';
import { Package, Wallet, Clock, TrendingUp, MapPin, Star } from 'lucide-react-native';
import { orderUpdateEmitter } from '@/src/utils/OrderUpdateEmitter';

type Props = StackScreenProps<DashboardStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const tabNavigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { orderHistory } = useSelector((state: RootState) => state.orders);
  const { wallet } = useSelector((state: RootState) => state.earnings);
  const { isOnline } = useSelector((state: RootState) => state.app);
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);
useEffect(() => {
  const reload = async () => {
    setRefreshing(true);  // <- Show loader
    await loadDashboardData();
    setRefreshing(false); // <- Hide loader
  };
  orderUpdateEmitter.on('orderUpdated', reload);
  return () => {
    orderUpdateEmitter.off('orderUpdated', reload);
  };
}, []);

  useEffect(() => {
    // Load orders when online status changes to online
    if (isOnline) {
      loadDashboardData();
    } else {
      // Clear orders when going offline
      setActiveOrders([]);
    }
  }, [isOnline]);

  const loadDashboardData = async () => {
    console.log('🔄 DashboardScreen - Loading dashboard data');
    
    try {
      // Only load orders if online
      if (isOnline) {
        // Load active orders from API
        console.log('📞 DashboardScreen - Calling GetOrderByUser API');
        const ordersPromise = GetOrderByUser().then(orders => {
          console.log('📦 DashboardScreen - Received orders from GetOrderByUser:', {
            totalOrders: orders.length,
            ordersPreview: orders.slice(0, 3).map(order => ({
              id: order.id,
              orderNumber: order.orderNumber,
              statusId: order.statusId,
              status: order.status
            }))
          });
          setActiveOrders(orders);
          return orders;
        });

        // Load wallet data
        const walletPromise = dispatch(fetchWalletData());

        await Promise.all([ordersPromise, walletPromise]);
      } else {
        // Only load wallet data when offline
        await dispatch(fetchWalletData());
      }
      
      console.log('✅ DashboardScreen - Dashboard data loaded successfully');
    } catch (error) {
      console.error('🚨 DashboardScreen - Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleToggleOnlineStatus = async (value: boolean) => {
    // If trying to go offline, check for active orders
    if (!value && activeOrders.length > 0) {
      // Check if there are any accepted/assigned orders (statusId 52 = assigned)
      const acceptedOrders = activeOrders.filter(order => order.statusId === 52);
      
      if (acceptedOrders.length > 0) {
        Alert.alert(
          'Cannot Go Offline',
          'Please complete delivery of the accepted orders before going offline.',
          [{ text: 'OK', style: 'default' }]
        );
        return; // Don't change the status
      }
    }
    
    // If going online, get and store the user's current location
    if (value) {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Get current location
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          
          // Store coordinates in secure storage
          await secureStorage.setItem('user_latitude', latitude.toString());
          await secureStorage.setItem('user_longitude', longitude.toString());
          
          console.log('📍 User coordinates stored:', { latitude, longitude });
        } else {
          console.warn('📍 Location permission not granted');
        }
      } catch (error) {
        console.error('🚨 Error getting/storing user location:', error);
      }
    }
    
    dispatch(setOnlineStatus(value));
    // TODO: integrate backend call here to update online status
  };

  const earnings = calculateEarnings(orderHistory);
  const pendingOrders = activeOrders.filter(order => order.statusId === 52).length; // statusId 52 = assigned

  // Custom functions for Dashboard status display
  const getDashboardOrderStatus = (status: string): string => {
    if (status === 'accepted') {
      return 'Available';
    }
    return formatOrderStatus(status);
  };

  const getDashboardOrderStatusColor = (status: string): string => {
    if (status === 'accepted') {
      return '#10B981'; // Green color for available orders
    }
    return getOrderStatusColor(status);
  };

  // Compute the orders card style
  const ordersCardStyle: ViewStyle = activeOrders.length > 0 
    ? StyleSheet.flatten([styles.ordersCard, styles.ordersCardWithData])
    : styles.ordersCard;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.onBackground }]}>
              {user?.name || 'Delivery Partner'}
            </Text>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineLabel, { color: isOnline ? theme.colors.success : theme.colors.onSurfaceVariant }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={(value) => handleToggleOnlineStatus(value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={isOnline ? '#FFFFFF' : theme.colors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Wallet color={theme.colors.primary} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(wallet.balance)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Wallet Balance
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Package color={theme.colors.accent} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {pendingOrders}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  New Orders
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <TrendingUp color={theme.colors.success} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(earnings.today)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Today's Earnings
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Star color={theme.colors.warning} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {user?.rating ? user.rating.toFixed(1) : '5.0'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Rating
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Available Orders Heading */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Available Orders
          </Text>
          {activeOrders.length > 0 && (
            <TouchableOpacity onPress={() => tabNavigation.navigate('OrdersTab')}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Orders */}
        {activeOrders.length === 0 ? (
          <Card style={styles.emptyOrdersCard}>
            <View style={styles.emptyState}>
              <Package color={theme.colors.onSurfaceVariant} size={48} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                No active orders
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                {isOnline ? 'New orders will appear here' : 'Please go online to have orders'}
              </Text>
            </View>
          </Card>
        ) :
         (
          <View style={styles.ordersList}>
            {activeOrders.map((order) => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderItem}
                onPress={() => navigation.navigate('OrderDetails', { order: order })}
              >
                {/* Order Header with Number and Status */}
                <View style={styles.orderHeader}>
                  <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                     #{order.orderNumber}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getDashboardOrderStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>
                      {getDashboardOrderStatus(order.status)}
                    </Text>
                  </View>
                </View>
                
                {/* Order Details Row */}
                <View style={styles.orderDetails}>
                  <View style={styles.orderInfo}>
                    <Text style={[styles.restaurantName, { color: theme.colors.onSurface }]}>
                      {order.restaurantName}
                    </Text>
                    <Text style={[styles.orderAmount, { color: theme.colors.primary }]}>
                      {formatCurrency(order.totalAmount)}
                    </Text>
                  </View>
                  <MapPin color={theme.colors.onSurfaceVariant} size={20} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              title="View Orders"
              onPress={() => tabNavigation.navigate('OrdersTab')}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Earnings"
              onPress={() => navigation.navigate('Earnings' as any)}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.lg,
  },
  greeting: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  userName: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    marginTop: lightTheme.spacing.xs,
  },
  onlineToggle: {
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  onlineLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: lightTheme.spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  statLabel: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  ordersCard: {
    marginBottom: lightTheme.spacing.md,
  },
  ordersCardWithData: {
    minHeight: 200, // Increase card height when it has data
    paddingBottom: lightTheme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  cardTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  viewAllText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
    marginTop: lightTheme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
    textAlign: 'center',
  },
  ordersList: {
    gap: lightTheme.spacing.md,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statusRow: {
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.3,
    flex: 1,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: lightTheme.colors.primary,
    marginTop: 4,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: lightTheme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actionsCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginTop: lightTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
    marginTop: lightTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  emptyOrdersCard: {
    marginTop: lightTheme.spacing.xl,
  },
});

export default DashboardScreen;
