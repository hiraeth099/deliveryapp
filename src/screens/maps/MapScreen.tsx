import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { DashboardStackParamList } from '../../navigation/DashboardNavigator';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { ArrowLeft, Navigation, MapPin, Phone, Clock } from 'lucide-react-native';

type Props = StackScreenProps<DashboardStackParamList, 'Map'>;

const MapScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = lightTheme;
  const { orderId } = route.params;
  
  // Mock order data - TODO: integrate backend call here
  const [orderData] = useState({
    id: orderId,
    orderNumber: 'ORD123456',
    customerName: 'John Doe',
    customerPhone: '+91 98765 43210',
    restaurantName: 'Pizza Palace',
    restaurantAddress: '123 Food Street, City Center',
    deliveryAddress: '456 Home Avenue, Residential Area',
    pickupLocation: { latitude: 17.4065, longitude: 78.4772 },
    dropLocation: { latitude: 17.4125, longitude: 78.4825 },
    status: 'accepted',
    estimatedTime: 25,
  });

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // TODO: integrate backend call here - get current location
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    // Mock current location - TODO: integrate backend call here
    setCurrentLocation({ latitude: 17.4065, longitude: 78.4772 });
  };

  const handleNavigateToPickup = () => {
    const { latitude, longitude } = orderData.pickupLocation;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleNavigateToDelivery = () => {
    const { latitude, longitude } = orderData.dropLocation;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${orderData.customerPhone}`);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Simple distance calculation - TODO: integrate backend call here for accurate routing
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const pickupDistance = currentLocation 
    ? calculateDistance(
        currentLocation.latitude, 
        currentLocation.longitude,
        orderData.pickupLocation.latitude,
        orderData.pickupLocation.longitude
      )
    : 0;

  const deliveryDistance = calculateDistance(
    orderData.pickupLocation.latitude,
    orderData.pickupLocation.longitude,
    orderData.dropLocation.latitude,
    orderData.dropLocation.longitude
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Order Map
        </Text>
        <TouchableOpacity onPress={handleCallCustomer} style={styles.callButton}>
          <Phone color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.mapPlaceholder}>
          <MapPin color={theme.colors.onSurfaceVariant} size={48} />
          <Text style={[styles.mapPlaceholderText, { color: theme.colors.onSurfaceVariant }]}>
            Map View
          </Text>
          <Text style={[styles.mapNote, { color: theme.colors.onSurfaceVariant }]}>
            Google Maps integration will be implemented here
          </Text>
        </View>
      </View>

      {/* Order Info */}
      <View style={styles.bottomSheet}>
        <Card style={styles.orderInfoCard}>
          <View style={styles.orderHeader}>
            <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
              #{orderData.orderNumber}
            </Text>
            <View style={styles.timeContainer}>
              <Clock color={theme.colors.warning} size={16} />
              <Text style={[styles.estimatedTime, { color: theme.colors.onSurface }]}>
                {orderData.estimatedTime} min
              </Text>
            </View>
          </View>
          
          <Text style={[styles.customerName, { color: theme.colors.onSurfaceVariant }]}>
            {orderData.customerName}
          </Text>
        </Card>

        {/* Pickup Location */}
        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationInfo}>
              <View style={[styles.locationDot, { backgroundColor: theme.colors.accent }]} />
              <View style={styles.locationDetails}>
                <Text style={[styles.locationTitle, { color: theme.colors.onSurface }]}>
                  Pickup from
                </Text>
                <Text style={[styles.locationName, { color: theme.colors.onSurface }]}>
                  {orderData.restaurantName}
                </Text>
                <Text style={[styles.locationAddress, { color: theme.colors.onSurfaceVariant }]}>
                  {orderData.restaurantAddress}
                </Text>
                {currentLocation && (
                  <Text style={[styles.locationDistance, { color: theme.colors.primary }]}>
                    {pickupDistance ? pickupDistance.toFixed(1) : '0.0'} km away
                  </Text>
                )}
              </View>
            </View>
            <Button
              title="Navigate"
              onPress={handleNavigateToPickup}
              variant="outline"
              size="small"
              icon={<Navigation color={theme.colors.primary} size={16} />}
            />
          </View>
        </Card>

        {/* Delivery Location */}
        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationInfo}>
              <View style={[styles.locationDot, { backgroundColor: theme.colors.success }]} />
              <View style={styles.locationDetails}>
                <Text style={[styles.locationTitle, { color: theme.colors.onSurface }]}>
                  Deliver to
                </Text>
                <Text style={[styles.locationName, { color: theme.colors.onSurface }]}>
                  {orderData.customerName}
                </Text>
                <Text style={[styles.locationAddress, { color: theme.colors.onSurfaceVariant }]}>
                  {orderData.deliveryAddress}
                </Text>
                <Text style={[styles.locationDistance, { color: theme.colors.primary }]}>
                  {deliveryDistance ? deliveryDistance.toFixed(1) : '0.0'} km from pickup
                </Text>
              </View>
            </View>
            <Button
              title="Navigate"
              onPress={handleNavigateToDelivery}
              variant="outline"
              size="small"
              icon={<Navigation color={theme.colors.primary} size={16} />}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Call Customer"
            onPress={handleCallCustomer}
            variant="outline"
            style={styles.actionButton}
            icon={<Phone color={theme.colors.primary} size={16} />}
          />
          <Button
            title="View Order Details"
            onPress={() => navigation.navigate('OrderDetails', { orderId })}
            style={styles.actionButton}
          />
        </View>
      </View>
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
    zIndex: 1,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: lightTheme.spacing.md,
  },
  mapPlaceholderText: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  mapNote: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    textAlign: 'center',
  },
  bottomSheet: {
    backgroundColor: lightTheme.colors.background,
    borderTopLeftRadius: lightTheme.borderRadius.xl,
    borderTopRightRadius: lightTheme.borderRadius.xl,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.lg,
    paddingBottom: lightTheme.spacing.xl,
    maxHeight: '60%',
  },
  orderInfoCard: {
    marginBottom: lightTheme.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  orderNumber: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.xs,
  },
  estimatedTime: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  customerName: {
    fontSize: lightTheme.typography.body.fontSize,
  },
  locationCard: {
    marginBottom: lightTheme.spacing.sm,
    padding: lightTheme.spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: lightTheme.spacing.md,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: lightTheme.spacing.xs,
    marginRight: lightTheme.spacing.md,
  },
  locationDetails: {
    flex: 1,
  },
  locationTitle: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.xs,
  },
  locationName: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs,
  },
  locationAddress: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 18,
    marginBottom: lightTheme.spacing.xs,
  },
  locationDistance: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginTop: lightTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default MapScreen;