import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { DashboardStackParamList } from '../../navigation/DashboardNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { acceptOrder, rejectOrder, updateOrderStatus } from '../../store/slices/ordersSlice';
import { formatCurrency, formatDate, formatOrderStatus, getOrderStatusColor, formatPhoneNumber } from '../../utils/formatters';
import { getOrders, GetOrderByUser, updateOrderStatusAPI, updatestatusId } from '../../utils/getapi';
import { Order, ORDER_STATUSES } from '../../types';
import { ArrowLeft, Phone, MapPin, Clock, Package, User, Navigation, X } from 'lucide-react-native';
import { orderUpdateEmitter } from '@/src/utils/OrderUpdateEmitter';

type Props = StackScreenProps<OrdersStackParamList, 'OrderDetails'> & {
  onOrderStatusUpdate?: () => void;
};

const OrderDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  // Extract params - could be orderId or order object
  const orderId = 'orderId' in route.params ? route.params.orderId : null;
  const orderParam = 'order' in route.params ? route.params.order : null;
  
  const [order, setOrder] = useState<Order | null>(orderParam || null);
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(!orderParam); // Don't fetch if order is already provided
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    // If we already have an order object, no need to fetch
    if (orderParam) {
      return;
    }
    
    // If we only have an orderId, fetch the order details
    const fetchOrderDetails = async () => {
      // Type guard to ensure orderId is not null
      if (!orderId || orderId === null) return;
      
      console.log('🔄 OrderDetailsScreen - Fetching order details for ID:', orderId);
      
      try {
        setFetchingOrder(true);
        let foundOrder: Order | undefined = undefined;
        
        // Try both APIs with proper error handling
        try {
          // First, try to find the order in available orders (GetOrderByUser) - this is more likely to work
          console.log('📞 OrderDetailsScreen - Calling GetOrderByUser API (available orders)');
          const availableOrders = await GetOrderByUser();
          console.log('📦 OrderDetailsScreen - Available orders fetched:', {
            totalOrders: availableOrders.length,
            searchingForId: orderId,
            orderIds: availableOrders.map(o => o.id)
          });
          
          foundOrder = availableOrders.find(o => o.id === orderId);
          console.log('🔍 OrderDetailsScreen - Search in available orders:', {
            orderId,
            found: !!foundOrder,
            foundOrder: foundOrder ? {
              id: foundOrder.id,
              orderNumber: foundOrder.orderNumber,
              status: foundOrder.status
            } : null
          });
        } catch (availableOrdersError) {
          console.warn('⚠️ OrderDetailsScreen - GetOrderByUser API failed:', availableOrdersError);
        }
        
        // If not found in available orders, try assigned orders (getOrders)
        if (!foundOrder) {
          try {
            console.log('📞 OrderDetailsScreen - Order not found in available orders, checking assigned orders');
            const assignedOrders = await getOrders();
            console.log('📦 OrderDetailsScreen - Assigned orders fetched:', {
              totalOrders: assignedOrders.length,
              searchingForId: orderId,
              orderIds: assignedOrders.map(o => o.id)
            });
            
            foundOrder = assignedOrders.find(o => o.id === orderId);
            console.log('🔍 OrderDetailsScreen - Search in assigned orders:', {
              orderId,
              found: !!foundOrder,
              foundOrder: foundOrder ? {
                id: foundOrder.id,
                orderNumber: foundOrder.orderNumber,
                status: foundOrder.status
              } : null
            });
          } catch (assignedOrdersError) {
            console.warn('⚠️ OrderDetailsScreen - getOrders API failed:', assignedOrdersError);
          }
        }
        
        setOrder(foundOrder || null);
        
        if (!foundOrder) {
          console.error('🚨 OrderDetailsScreen - Order not found in either API:', {
            orderId,
            searchedInAvailableOrders: true,
            searchedInAssignedOrders: true
          });
        }
        
      } catch (error) {
        console.error('🚨 OrderDetailsScreen - Error fetching order:', error);
        setOrder(null);
      } finally {
        setFetchingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, orderParam]);

  if (fetchingOrder) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAcceptOrder = async () => {
    setLoading(true);
    try {
      // Use the order id from the order object if we have it, otherwise use the route param
      const id = order?.id || orderId;
      if (!id) return;
      
      await dispatch(acceptOrder(id)).unwrap();
      Alert.alert('Success', 'Order accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = () => {
    // Use the order id from the order object if we have it, otherwise use the route param
    const id = order?.id || orderId;
    if (!id) return;
    
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await dispatch(rejectOrder({ orderId: id, reason: 'Driver rejected' })).unwrap();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject order');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (status: string) => {
    // Use the order id from the order object if we have it, otherwise use the route param
    const id = order?.id || orderId;
    if (!id) return;
    
    setLoading(true);
    try {
      // TODO: integrate backend call here - get current location
      const location = { latitude: 0, longitude: 0 }; // Mock location
      await dispatch(updateOrderStatus({ orderId: id, status: status as any, location })).unwrap();
      Alert.alert('Success', `Order status updated to ${formatOrderStatus(status)}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleNavigate = (location: 'pickup' | 'drop') => {
    const coords = location === 'pickup' ? order.pickupLocation : order.dropLocation;
    const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  const getNextAction = () => {
    switch (order.status) {
      case 'assigned':
        return { label: 'Accept Order', action: handleAcceptOrder, variant: 'primary' as const };
      case 'accepted':
        // For accepted orders, we'll show separate Reject and Accept buttons instead of a single action
        return null;
      case 'picked':
        return { label: 'Start Delivery', action: () => handleUpdateStatus('en_route'), variant: 'primary' as const };
      case 'en_route':
        return { label: 'Mark as Delivered', action: () => handleUpdateStatus('delivered'), variant: 'primary' as const };
      default:
        return null;
    }
  };

  const getNextStatusId = (currentStatusId: number): number | null => {
    // Define the status progression based on ORDER_STATUSES
    const statusProgression: Record<number, number> = {
      52: 53,  // assigned -> started
      53: 65,  // started -> at_the_restaurant  
      65: 54,  // at_the_restaurant -> picked
      54: 56,  // picked -> out_for_delivery
      56: 57,  // out_for_delivery -> reached
      57: 58,  // reached -> delivered
    };
    
    // Special case for reached status - show both 58 and 263 options
    if (currentStatusId === 57) {
      return 58; // Default to delivered, but UI should show both options
    }
    
    return statusProgression[currentStatusId] || null;
  };

  const getNextStatusName = (currentStatusId: number): string | null => {
    const nextStatusId = getNextStatusId(currentStatusId);
    if (!nextStatusId) return null;
    
    const nextStatus = ORDER_STATUSES[nextStatusId.toString()];
    return nextStatus ? formatOrderStatus(nextStatus.name) : null;
  };

  const handleStatusCardPress = () => {
    if (order && order.statusId >= 52) {
      setShowStatusModal(true);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!order) return;
    
    const nextStatusId = getNextStatusId(order.statusId);
    if (!nextStatusId) return;
    
    setLoading(true);
    try {
      await updatestatusId({
        id: parseInt(order.id,10),
        statusId: nextStatusId,
        deliveryStaffId: 0, // will be overwritten inside API anyway
        deliveryStaffContactNo: '' // also handled internally
      });

      // Update local order state
      const nextStatusName = ORDER_STATUSES[nextStatusId.toString()]?.name;
      const updatedOrder = { 
        ...order, 
        statusId: nextStatusId,
        status: nextStatusName as any || order.status
      };
      setOrder(updatedOrder);
      
       orderUpdateEmitter.emit('orderUpdated');
      if (route.params && 'onOrderStatusUpdate' in route.params) {
        (route.params as any).onOrderStatusUpdate?.();
      } else {
        // Fallback: navigate back to refresh the parent screen
        navigation.goBack();
      }
      
      setShowStatusModal(false);
      Alert.alert('Success', `Order status updated to ${getNextStatusName(order.statusId)}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
      // navigation.goBack();
  };

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Order Details
        </Text>
        <TouchableOpacity onPress={handleCallCustomer} style={styles.callButton}>
          <Phone color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status */}
          <TouchableOpacity 
            onPress={handleStatusCardPress}
            disabled={!order || order.statusId < 52}
          >
            <Card style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>
                    {order.status === 'accepted' ? 'Available' : formatOrderStatus(order.status)}
                  </Text>
                </View>
                <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                  #{order.orderNumber}
                </Text>
              </View>
              <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
                Ordered at {formatDate(order.createdAt, 'time')}
              </Text>
              {order.statusId >= 52 && (
                <Text style={[styles.tapToUpdate, { color: theme.colors.primary }]}>
                  Tap to update status
                </Text>
              )}
            </Card>
          </TouchableOpacity>

        {/* Customer Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Customer Details
          </Text>
          <ListItem
            title={order.customerName || 'Customer'}
            subtitle={formatPhoneNumber(order.customerPhone)}
            leftIcon={<User color={theme.colors.primary} size={24} />}
            rightIcon={<Phone color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={handleCallCustomer}
          />
        </Card>

        {/* Pickup Location */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Pickup Location
          </Text>
          <ListItem
            title={order.restaurantName}
            subtitle={order.restaurantAddress}
            leftIcon={<Package color={theme.colors.accent} size={24} />}
            rightIcon={<Navigation color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => handleNavigate('pickup')}
          />
        </Card>

        {/* Drop Location */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Delivery Location
          </Text>
          <ListItem
            title="Delivery Address"
            subtitle={order.deliveryAddress}
            leftIcon={<MapPin color={theme.colors.success} size={24} />}
            rightIcon={<Navigation color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => handleNavigate('drop')}
          />
        </Card>

        {/* Calculate Route - only show for available/accepted orders */}
        {(order.status === 'assigned' || order.status === 'accepted') && (
          <Card>
            <ListItem
              title="Calculate Route"
              subtitle="View route from your location to restaurant and customer"
              leftIcon={<Navigation color={theme.colors.primary} size={24} />}
              onPress={() => {}}
            />
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Order Items
          </Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>
                  {item.quantity}x {item.name}
                </Text>
                {item.customizations && item.customizations.length > 0 && (
                  <Text style={[styles.itemCustomizations, { color: theme.colors.onSurfaceVariant }]}>
                    {item.customizations.join(', ')}
                  </Text>
                )}
              </View>
              <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Payment Summary */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Payment Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.totalAmount - order.deliveryFee)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.deliveryFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
          <View style={styles.paymentMethod}>
            <Text style={[styles.paymentLabel, { color: theme.colors.onSurfaceVariant }]}>
              Payment Method: {order.paymentMethod.toUpperCase()}
            </Text>
          </View>
        </Card>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Special Instructions
            </Text>
            <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
              {order.specialInstructions}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {order.statusId === 5 ? (
          // When statusId is 5, show Accept and Reject buttons
          <>
            <Button
              title="Reject"
              onPress={handleRejectOrder}
              variant="outline"
              style={styles.rejectButton}
              loading={loading}
            />
            <Button
              title="Accept"
              onPress={async () => {
                setLoading(true);
                try {
                  await updatestatusId({
                    id: parseInt(order.id, 10),
                    statusId: 52, // Update status to 52 when accepting
                    deliveryStaffId: 0,
                    deliveryStaffContactNo: ''
                  });
                  orderUpdateEmitter.emit('orderUpdated');
                  if (route.params && 'onOrderStatusUpdate' in route.params) {
                    (route.params as any).onOrderStatusUpdate?.();
                  } else {
                    navigation.goBack();
                  }
                  Alert.alert('Success', 'Order accepted successfully');
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to accept order');
                } finally {
                  setLoading(false);
                }
              }}
              variant="primary"
              style={styles.actionButton}
              loading={loading}
            />
          </>
        ) : order.status === 'assigned' ? (
          <>
            <Button
              title="Reject"
              onPress={handleRejectOrder}
              variant="outline"
              style={styles.rejectButton}
              loading={loading}
            />
            <Button
              title="Accept Order"
              onPress={handleAcceptOrder}
              variant="primary"
              style={styles.actionButton}
              loading={loading}
            />
          </>
        ) : order.status === 'accepted' ? (
          <>
            <Button
              title="Reject"
              onPress={handleRejectOrder}
              variant="outline"
              style={styles.rejectButton}
              loading={loading}
            />
            <Button
              title="Accept"
              onPress={async () => {
                setLoading(true);
                try {
                  await updatestatusId({
                    id: parseInt(order.id, 10),
                    statusId: 52, // Use statusId 52 for accept
                    deliveryStaffId: 0,
                    deliveryStaffContactNo: ''
                  });
                  orderUpdateEmitter.emit('orderUpdated');
                  if (route.params && 'onOrderStatusUpdate' in route.params) {
                    (route.params as any).onOrderStatusUpdate?.();
                  } else {
                    navigation.goBack();
                  }
                  Alert.alert('Success', 'Order accepted successfully');
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to accept order');
                } finally {
                  setLoading(false);
                }
              }}
              variant="primary"
              style={styles.actionButton}
              loading={loading}
            />
          </>
        ) : nextAction && (
          <Button
            title={nextAction.label}
            onPress={nextAction.action}
            variant={nextAction.variant}
            style={styles.actionButton}
            loading={loading}
          />
        )}
      </View>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Update Order Status
              </Text>
              <TouchableOpacity 
                onPress={() => setShowStatusModal(false)}
                style={styles.closeButton}
              >
                <X color={theme.colors.onSurfaceVariant} size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.currentStatusText, { color: theme.colors.onSurfaceVariant }]}>
                Current Status: {order ? formatOrderStatus(order.status) : ''}
              </Text>
              
              {order && getNextStatusName(order.statusId) && (
                <Button
                  title={`Mark as ${getNextStatusName(order.statusId)}`}
                  onPress={handleUpdateOrderStatus}
                  variant="primary"
                  style={styles.updateButton}
                  loading={loading}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: lightTheme.spacing.sm,
  },
  title: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  callButton: {
    padding: lightTheme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  statusCard: {
    marginBottom: lightTheme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.full,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  orderTime: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: lightTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  itemCustomizations: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  itemPrice: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.sm,
  },
  summaryLabel: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  summaryValue: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
    marginTop: lightTheme.spacing.sm,
    paddingTop: lightTheme.spacing.md,
  },
  totalLabel: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  paymentMethod: {
    marginTop: lightTheme.spacing.sm,
  },
  paymentLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  instructions: {
    fontSize: lightTheme.typography.body.fontSize,
    lineHeight: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    gap: lightTheme.spacing.md,
  },
  rejectButton: {
    flex: 1,
  },
  actionButton: {
    flex: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  tapToUpdate: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.lg,
    margin: lightTheme.spacing.lg,
    minWidth: 300,
    maxWidth: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  modalTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  closeButton: {
    padding: lightTheme.spacing.sm,
  },
  modalBody: {
    alignItems: 'center',
  },
  currentStatusText: {
    fontSize: lightTheme.typography.body.fontSize,
    marginBottom: lightTheme.spacing.lg,
    textAlign: 'center',
  },
  updateButton: {
    minWidth: 200,
  },
});

export default OrderDetailsScreen;