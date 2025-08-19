import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { setTheme, setLanguage } from '../../store/slices/appSlice';
import { ArrowLeft, Bell, Moon, Globe, Volume2, Vibrate, Shield, CircleHelp as HelpCircle, ChevronRight } from 'lucide-react-native';

type Props = StackScreenProps<ProfileStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { theme: currentTheme, language } = useSelector((state: RootState) => state.app);
  
  // Local state for notification settings
  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    promotions: false,
    sound: true,
    vibration: true,
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  const handleThemeToggle = (isDark: boolean) => {
    dispatch(setTheme(isDark ? 'dark' : 'light'));
  };

  const handleLanguageSelect = (langCode: string) => {
    dispatch(setLanguage(langCode as any));
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // TODO: integrate backend call here to save notification preferences
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Appearance */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Appearance
          </Text>
          
          <ListItem
            title="Dark Mode"
            subtitle="Switch between light and dark theme"
            leftIcon={<Moon color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={
              <Switch
                value={currentTheme === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={currentTheme === 'dark' ? '#FFFFFF' : theme.colors.onSurfaceVariant}
              />
            }
          />
        </Card>

        {/* Language */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Language
          </Text>
          
          {languages.map((lang) => (
            <ListItem
              key={lang.code}
              title={lang.name}
              leftIcon={<Globe color={theme.colors.onSurfaceVariant} size={24} />}
              rightIcon={
                language === lang.code ? (
                  <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]} />
                ) : (
                  <ChevronRight color={theme.colors.onSurfaceVariant} size={20} />
                )
              }
              onPress={() => handleLanguageSelect(lang.code)}
            />
          ))}
        </Card>

        {/* Notifications */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Notifications
          </Text>
          
          <ListItem
            title="Order Alerts"
            subtitle="Get notified about new orders and updates"
            leftIcon={<Bell color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={
              <Switch
                value={notifications.orderAlerts}
                onValueChange={(value) => handleNotificationToggle('orderAlerts', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={notifications.orderAlerts ? '#FFFFFF' : theme.colors.onSurfaceVariant}
              />
            }
          />
          
          <ListItem
            title="Promotions"
            subtitle="Receive promotional offers and updates"
            leftIcon={<Bell color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={
              <Switch
                value={notifications.promotions}
                onValueChange={(value) => handleNotificationToggle('promotions', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={notifications.promotions ? '#FFFFFF' : theme.colors.onSurfaceVariant}
              />
            }
          />
          
          <ListItem
            title="Sound"
            subtitle="Play sound for notifications"
            leftIcon={<Volume2 color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={
              <Switch
                value={notifications.sound}
                onValueChange={(value) => handleNotificationToggle('sound', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={notifications.sound ? '#FFFFFF' : theme.colors.onSurfaceVariant}
              />
            }
          />
          
          <ListItem
            title="Vibration"
            subtitle="Vibrate for notifications"
            leftIcon={<Vibrate color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={
              <Switch
                value={notifications.vibration}
                onValueChange={(value) => handleNotificationToggle('vibration', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={notifications.vibration ? '#FFFFFF' : theme.colors.onSurfaceVariant}
              />
            }
          />
        </Card>

        {/* Privacy & Security */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Privacy & Security
          </Text>
          
          <ListItem
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            leftIcon={<Shield color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => {
              // TODO: integrate backend call here - open privacy policy
              console.log('Open privacy policy');
            }}
          />
          
          <ListItem
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            leftIcon={<Shield color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => {
              // TODO: integrate backend call here - open terms of service
              console.log('Open terms of service');
            }}
          />
        </Card>

        {/* Support */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Support
          </Text>
          
          <ListItem
            title="Help Center"
            subtitle="Get help and support"
            leftIcon={<HelpCircle color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => {
              // TODO: integrate backend call here - open help center
              console.log('Open help center');
            }}
          />
          
          <ListItem
            title="Contact Support"
            subtitle="Reach out to our support team"
            leftIcon={<HelpCircle color={theme.colors.onSurfaceVariant} size={24} />}
            rightIcon={<ChevronRight color={theme.colors.onSurfaceVariant} size={20} />}
            onPress={() => {
              // Navigate to create ticket screen
              navigation.navigate('CreateTicket' as any);
            }}
          />
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Text style={[styles.appName, { color: theme.colors.onSurface }]}>
            Delivery Partner App
          </Text>
          <Text style={[styles.appVersion, { color: theme.colors.onSurfaceVariant }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appDescription, { color: theme.colors.onSurfaceVariant }]}>
            Built with ❤️ for delivery partners
          </Text>
        </Card>
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
  backButton: {
    padding: lightTheme.spacing.sm,
  },
  title: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  sectionCard: {
    marginBottom: lightTheme.spacing.md,
    padding: 0,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    paddingHorizontal: lightTheme.spacing.md,
    paddingTop: lightTheme.spacing.md,
    paddingBottom: lightTheme.spacing.sm,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoCard: {
    marginBottom: lightTheme.spacing.xl,
    alignItems: 'center',
  },
  appName: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.xs,
  },
  appVersion: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginBottom: lightTheme.spacing.sm,
  },
  appDescription: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    textAlign: 'center',
  },
});

export default SettingsScreen;