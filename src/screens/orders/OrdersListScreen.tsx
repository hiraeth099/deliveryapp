import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import {  useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { getOrders, filterOrders } from '../../utils/getapi';
import { formatCurrency, formatDate, formatOrderStatus, getOrderStatusColor } from '../../utils/formatters';
import { Order } from '../../types';
import { secureStorage } from '../../storage/secureStorage';
import { Package, Filter, Calendar, MapPin } from 'lucide-react-native';
import { orderUpdateEmitter } from '@/src/utils/OrderUpdateEmitter';
import { rejectedOrdersStorage } from '../../utils/rejectedOrdersStorage';

type Props = StackScreenProps<OrdersStackParamList, 'OrdersList'>;

const ORDERS_REFRESH_INTERVAL = 300000; // 30 seconds

const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [rejectedOrderIds, setRejectedOrderIds] = useState<string[]>([]);

  useEffect(() => {
  const reload = async () => {
    // force spinner
    setIsLoading(true);
    try {
      // fetch fresh data (no need for the `showLoading` parameter here)
      await loadOrders(false);
    } finally {
      setIsLoading(false);
    }
  };
  orderUpdateEmitter.on('orderUpdated', reload);
  return () => void orderUpdateEmitter.off('orderUpdated', reload);
}, []);


  useEffect(() => {
    // Log secure storage values for debugging
    const checkStorageValues = async () => {
      try {
        const myId = await secureStorage.getItem('myId');
        const resId = await secureStorage.getItem('resId');
        console.log('🔑 OrdersListScreen - Secure storage values:', {
          myId,
          resId,
          myIdParsed: myId ? parseInt(myId, 10) : 'null',
          hasValidMyId: myId && !isNaN(parseInt(myId, 10))
        });
        
        // Load rejected order IDs and cleanup old ones
        await rejectedOrdersStorage.cleanupOldRejectedOrders();
        const rejectedIds = await rejectedOrdersStorage.getRejectedOrderIds();
        setRejectedOrderIds(rejectedIds);
        console.log('🚫 OrdersListScreen - Rejected order IDs loaded:', rejectedIds);
      } catch (error) {
        console.error('🚨 OrdersListScreen - Error reading secure storage:', error);
      }
    };
    
    checkStorageValues();
    // Initial load with loading state
    loadOrders(true);
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      console.log(`🔄 OrdersListScreen - Auto-refresh triggered (${ORDERS_REFRESH_INTERVAL/1000}s interval)`);
      loadOrders(false); // Subsequent calls without loading state
    }, ORDERS_REFRESH_INTERVAL);
    
    // Cleanup interval on unmount or activeTab change
    return () => {
      console.log('🧹 OrdersListScreen - Cleaning up auto-refresh interval');
      clearInterval(intervalId);
    };
  }, [activeTab]);

  const loadOrders = async (showLoading: boolean = false) => {
    console.log('🔄 OrdersListScreen - loadOrders started', { showLoading });
    
    try {
      // Only set loading state if there's no existing data or explicitly requested
      const shouldShowLoading = showLoading && activeOrders.length === 0 && orderHistory.length === 0;
      if (shouldShowLoading) {
        setIsLoading(true);
        console.log('⏳ OrdersListScreen - Loading state set to true');
      }
      
      // Get all orders from getOrders API only
      console.log('📞 OrdersListScreen - Calling getOrders API');
      const allOrders = await getOrders();
      console.log('📦 OrdersListScreen - Received orders from API:', {
        totalOrders: allOrders.length,
        ordersPreview: allOrders.slice(0, 3).map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          statusId: order.statusId,
          status: order.status
        })),
        allOrderIds: allOrders.map(order => order.id)
      });
      
      // Filter orders into current and past using existing filterOrders logic
      console.log('🔍 OrdersListScreen - Filtering orders');
      const { currentOrders, pastOrders } = filterOrders(allOrders);
      
      // Filter out rejected orders
      const filteredCurrentOrders = currentOrders.filter(order => !rejectedOrderIds.includes(order.id));
      const filteredPastOrders = pastOrders.filter(order => !rejectedOrderIds.includes(order.id));
      
      console.log('📊 OrdersListScreen - Filter results:', {
        totalInput: allOrders.length,
        currentOrdersCount: filteredCurrentOrders.length,
        pastOrdersCount: filteredPastOrders.length,
        rejectedOrdersFiltered: currentOrders.length - filteredCurrentOrders.length + pastOrders.length - filteredPastOrders.length,
        currentOrderIds: filteredCurrentOrders.map(order => order.id),
        pastOrderIds: filteredPastOrders.map(order => order.id)
      });
      
      // Set the filtered orders
      console.log('💾 OrdersListScreen - Setting state with filtered orders');
      setActiveOrders(filteredCurrentOrders);
      setOrderHistory(filteredPastOrders);
      // Reset network error state on successful load
      setNetworkError(false);
      
      console.log('✅ OrdersListScreen - State updated successfully:', {
        activeOrdersLength: filteredCurrentOrders.length,
        orderHistoryLength: filteredPastOrders.length
      });
      
    } catch (error) {
      console.error('🚨 OrdersListScreen - Error loading orders:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Only clear data and show error if there's no existing data
      if (activeOrders.length === 0 && orderHistory.length === 0) {
        // Set empty arrays on error to show empty state when there's no existing data
        setActiveOrders([]);
        setOrderHistory([]);
        setNetworkError(true);
      }
      // If there's existing data, we keep it and don't show error message
    } finally {
      if (showLoading) {
        setIsLoading(false);
        console.log('⏹️ OrdersListScreen - Loading state set to false');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Reload rejected order IDs
    await rejectedOrdersStorage.cleanupOldRejectedOrders();
    const rejectedIds = await rejectedOrdersStorage.getRejectedOrderIds();
    setRejectedOrderIds(rejectedIds);
    
    await loadOrders(false); // Manual refresh doesn't need loading state
    setRefreshing(false);
  };

  const orders = activeTab === 'active' ? activeOrders : orderHistory;
  
  console.log('🎯 OrdersListScreen - Current render state:', {
    activeTab,
    activeOrdersCount: activeOrders.length,
    orderHistoryCount: orderHistory.length,
    currentOrdersCount: orders.length,
    isLoading,
    refreshing
  });

  // Show loading overlay only when there's no data at all
  const shouldShowLoadingOverlay = isLoading 
  
  if (shouldShowLoadingOverlay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Orders
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color={theme.colors.onSurfaceVariant} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'active' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'active' ? '#FFFFFF' : theme.colors.onSurface },
              ]}
            >
              Active ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? '#FFFFFF' : theme.colors.onSurface },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Orders
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={theme.colors.onSurfaceVariant} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'active' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'active' ? '#FFFFFF' : theme.colors.onSurface },
            ]}
          >
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'history' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'history' ? '#FFFFFF' : theme.colors.onSurface },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

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
        {orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Package color={theme.colors.onSurfaceVariant} size={48} />
              {networkError ? (
                <>
                  <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                    Server Problem
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                    There is a problem with our server. Please try again later.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                    No {activeTab} orders
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                    {activeTab === 'active' 
                      ? 'New orders will appear here when assigned'
                      : 'Your completed orders will appear here'
                    }
                  </Text>
                </>
              )}
            </View>
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <TouchableOpacity 
                  style={styles.orderItem}
                  onPress={() => navigation.navigate('OrderDetails', { 
                    order: order
                  })}
                >
                  {/* Order Header with Number and Status */}
                  <View style={styles.orderHeader}>
                    <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                       #{order.orderNumber}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>
                        {formatOrderStatus(order.status)}
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
                  
                  {/* Order Meta Row */}
                  <View style={styles.orderMeta}>
                    <View style={styles.metaItem}>
                      <Calendar color={theme.colors.onSurfaceVariant} size={16} />
                      <View style={styles.dateTimeContainer}>
                        <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                          {formatDate(order.createdAt, 'short')}
                        </Text>
                        <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                          {formatDate(order.createdAt, 'time')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.distanceText, { color: theme.colors.onSurfaceVariant }]}>
                      {order.distance ? order.distance.toFixed(1) : '0.0'} km
                    </Text>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  title: {
    fontSize: lightTheme.typography.h2.fontSize,
    fontWeight: lightTheme.typography.h2.fontWeight,
  },
  filterButton: {
    padding: lightTheme.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.surfaceVariant,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.xs,
    marginHorizontal: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: lightTheme.typography.button.fontSize,
    fontWeight: lightTheme.typography.button.fontWeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  emptyCard: {
    marginTop: lightTheme.spacing.xl,
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
  orderCard: {
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
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
  orderItem: {
    padding: 16,
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
    marginBottom: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: lightTheme.colors.primary,
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
    minWidth: 80,
    alignItems: 'center',
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
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.04)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.08)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeContainer: {
    flexDirection: 'column',
    marginLeft: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4a5568',
    lineHeight: 14,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2d3748',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xxl,
  },
  loadingText: {
    fontSize: lightTheme.typography.body.fontSize,
    marginTop: lightTheme.spacing.md,
    textAlign: 'center',
  },
});

export default OrdersListScreen;