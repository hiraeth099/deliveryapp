import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { formatDistance, formatTime } from '../../utils/formatters';
import { ArrowLeft, Navigation, Clock, Zap, MapPin, Route } from 'lucide-react-native';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface NavigationScreenProps {
  route: {
    params: {
      orderId: string;
      orderNumber: string;
      type: 'pickup' | 'drop' | 'route';
      pickupLocation: { latitude: number; longitude: number; address: string };
      dropLocation: { latitude: number; longitude: number; address: string };
      restaurantName?: string;
      customerName?: string;
    };
  };
  navigation: any;
}

interface RouteInfo {
  distance: string;
  duration: string;
  traffic: 'light' | 'moderate' | 'heavy';
  speed: string;
  eta: string;
}

const NavigationScreen: React.FC<NavigationScreenProps> = ({ route, navigation }) => {
  const theme = lightTheme;
  const { orderId, orderNumber, type, pickupLocation, dropLocation, restaurantName, customerName } = route.params;
  
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    distance: '0 km',
    duration: '0 min',
    traffic: 'light',
    speed: '0 km/h',
    eta: '--:--'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    calculateRoute();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for navigation');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      // Fallback to pickup location
      setCurrentLocation(pickupLocation);
    }
  };

  const calculateRoute = async () => {
    try {
      setLoading(true);
      
      // Mock route calculation - Replace with actual Google Directions API call
      const mockRouteData = await simulateGoogleDirectionsAPI();
      
      setRouteCoordinates(mockRouteData.coordinates);
      setRouteInfo(mockRouteData.info);
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateGoogleDirectionsAPI = async (): Promise<{ coordinates: any[], info: RouteInfo }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let coordinates: { latitude: number; longitude: number }[] = [];
    let distance = 0;
    let duration = 0;
    
    if (type === 'pickup' && currentLocation) {
      // Route from current location to pickup
      coordinates = [currentLocation, pickupLocation];
      distance = calculateDistance(currentLocation, pickupLocation);
      duration = Math.round(distance * 3); // Rough estimate: 3 min per km
    } else if (type === 'drop') {
      // Route from pickup to drop
      coordinates = [pickupLocation, dropLocation];
      distance = calculateDistance(pickupLocation, dropLocation);
      duration = Math.round(distance * 3);
    } else if (type === 'route' && currentLocation) {
      // Full route: current -> pickup -> drop
      coordinates = [currentLocation, pickupLocation, dropLocation];
      const dist1 = calculateDistance(currentLocation, pickupLocation);
      const dist2 = calculateDistance(pickupLocation, dropLocation);
      distance = dist1 + dist2;
      duration = Math.round(distance * 3);
    }

    const now = new Date();
    const eta = new Date(now.getTime() + duration * 60000);
    
    return {
      coordinates,
      info: {
        distance: `${distance.toFixed(1)} km`,
        duration: `${duration} min`,
        traffic: duration > 20 ? 'heavy' : duration > 10 ? 'moderate' : 'light',
        speed: `${Math.round(distance / (duration / 60))} km/h`,
        eta: eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    };
  };

  const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getMapRegion = () => {
    if (!currentLocation || routeCoordinates.length === 0) {
      return {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const allCoordinates = [...routeCoordinates];
    const latitudes = allCoordinates.map(coord => coord.latitude);
    const longitudes = allCoordinates.map(coord => coord.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  const getTitle = () => {
    switch (type) {
      case 'pickup':
        return `Navigate to ${restaurantName}`;
      case 'drop':
        return `Navigate to Customer`;
      case 'route':
        return 'Complete Route';
      default:
        return 'Navigation';
    }
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'light':
        return theme.colors.success;
      case 'moderate':
        return theme.colors.warning;
      case 'heavy':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
            #{orderNumber}
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            {getTitle()}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsTraffic={true}
        >
          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              pinColor={theme.colors.primary}
            />
          )}
          
          {/* Pickup Location Marker */}
          <Marker
            coordinate={pickupLocation}
            title={restaurantName || 'Pickup Location'}
            description={pickupLocation.address}
            pinColor={theme.colors.accent}
          />
          
          {/* Drop Location Marker */}
          <Marker
            coordinate={dropLocation}
            title={customerName || 'Delivery Location'}
            description={dropLocation.address}
            pinColor={theme.colors.success}
          />
          
          {/* Route Polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.colors.primary}
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      </View>

      {/* Route Information Card */}
      <View style={[styles.infoContainer, { backgroundColor: theme.colors.surface }]}>
        <Card style={styles.routeInfoCard}>
          <View style={styles.routeHeader}>
            <Route color={theme.colors.primary} size={24} />
            <Text style={[styles.routeTitle, { color: theme.colors.onSurface }]}>
              Route Information
            </Text>
          </View>
          
          <View style={styles.routeStats}>
            <View style={styles.statItem}>
              <MapPin color={theme.colors.onSurfaceVariant} size={20} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {routeInfo.distance}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Distance
                </Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <Clock color={theme.colors.onSurfaceVariant} size={20} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {routeInfo.duration}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Duration
                </Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <Zap color={getTrafficColor(routeInfo.traffic)} size={20} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: getTrafficColor(routeInfo.traffic) }]}>
                  {routeInfo.traffic.toUpperCase()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Traffic
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.etaContainer}>
            <Text style={[styles.etaLabel, { color: theme.colors.onSurfaceVariant }]}>
              Estimated Arrival
            </Text>
            <Text style={[styles.etaTime, { color: theme.colors.primary }]}>
              {routeInfo.eta}
            </Text>
          </View>
        </Card>
        
        {/* Action Button */}
        <Button
          title="Start Navigation"
          onPress={() => {
            // Open in Google Maps
            const destination = type === 'pickup' ? pickupLocation : dropLocation;
            const url = `https://maps.google.com/?q=${destination.latitude},${destination.longitude}`;
            // Linking.openURL(url);
            Alert.alert('Navigation', 'This would open Google Maps for turn-by-turn navigation');
          }}
          style={styles.navigationButton}
          icon={<Navigation color="#FFFFFF" size={20} />}
        />
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
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  backButton: {
    padding: lightTheme.spacing.sm,
    marginRight: lightTheme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderTopLeftRadius: lightTheme.borderRadius.xl,
    borderTopRightRadius: lightTheme.borderRadius.xl,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.lg,
    paddingBottom: lightTheme.spacing.xl,
  },
  routeInfoCard: {
    marginBottom: lightTheme.spacing.md,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.lg,
  },
  routeTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: lightTheme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  statInfo: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  etaContainer: {
    alignItems: 'center',
    paddingTop: lightTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
  },
  etaLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginBottom: lightTheme.spacing.xs,
  },
  etaTime: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  navigationButton: {
    marginTop: lightTheme.spacing.md,
  },
});

export default NavigationScreen;