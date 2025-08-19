import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { ListItem } from '../../components/ListItem';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { logoutUser } from '../../store/slices/authSlice';
import { formatPhoneNumber } from '../../utils/formatters';
import { User, CreditCard as Edit, FileText, Settings, Lock, LogOut, Star, Package, ChevronRight, Camera } from 'lucide-react-native';

type Props = StackScreenProps<ProfileStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            User data not available
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Profile
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <User color="#FFFFFF" size={32} />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Camera color={theme.colors.primary} size={16} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
                {user.name}
              </Text>
              <Text style={[styles.userPhone, { color: theme.colors.onSurfaceVariant }]}>
                {formatPhoneNumber(user.phone)}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
                {user.email}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Star color={theme.colors.warning} size={20} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {user.rating ? user.rating.toFixed(1) : '5.0'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Rating
                </Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Package color={theme.colors.success} size={20} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {user.totalDeliveries}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Deliveries
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Vehicle Info */}
        <Card style={styles.vehicleCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Vehicle Information
          </Text>
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleType, { color: theme.colors.onSurface }]}>
              {user.vehicleType ? user.vehicleType.charAt(0).toUpperCase() + user.vehicleType.slice(1) : 'Not specified'}
            </Text>
            <View style={[
              styles.onlineStatus,
              { backgroundColor: user.isOnline ? theme.colors.success : theme.colors.onSurfaceVariant }
            ]}>
              <Text style={styles.onlineStatusText}>
                {user.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <ListItem
            title="Edit Profile"
            subtitle="Update your personal information"
            leftIcon={<Edit color={theme.colors.primary} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          
          <ListItem
            title="Documents"
            subtitle="Manage your documents and verification"
            leftIcon={<FileText color={theme.colors.accent} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => navigation.navigate('Documents')}
          />
          
          <ListItem
            title="Settings"
            subtitle="App preferences and notifications"
            leftIcon={<Settings color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => navigation.navigate('Settings')}
          />
          
          <ListItem
            title="Change Password"
            subtitle="Update your account password"
            leftIcon={<Lock color={theme.colors.warning} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          icon={<LogOut color={theme.colors.error} size={20} />}
          textStyle={{ color: theme.colors.error }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  title: {
    fontSize: lightTheme.typography.h2.fontSize,
    fontWeight: lightTheme.typography.h2.fontWeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  profileCard: {
    marginBottom: lightTheme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: lightTheme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: lightTheme.colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    marginBottom: lightTheme.spacing.xs,
  },
  userPhone: {
    fontSize: lightTheme.typography.body.fontSize,
    marginBottom: lightTheme.spacing.xs,
  },
  userEmail: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: lightTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: lightTheme.borderRadius.full,
    backgroundColor: lightTheme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: lightTheme.colors.border,
    marginHorizontal: lightTheme.spacing.md,
  },
  vehicleCard: {
    marginBottom: lightTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  onlineStatus: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.full,
  },
  onlineStatusText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  menuCard: {
    marginBottom: lightTheme.spacing.md,
    padding: 0,
  },
  logoutButton: {
    marginBottom: lightTheme.spacing.xl,
    borderColor: lightTheme.colors.error,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: lightTheme.typography.body.fontSize,
  },
});

export default ProfileScreen;