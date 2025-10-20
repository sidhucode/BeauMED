import React, {useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { Amplify } from 'aws-amplify';
import { RouterProvider, useRouter } from './src/navigation/SimpleRouter';
import { NotificationsProvider } from './src/state/NotificationsContext';
import { MedicationsProvider } from './src/state/MedicationsContext';
import { ProfileProvider } from './src/state/ProfileContext';
import { ThemeProvider, useTheme } from './src/state/ThemeContext';
import { Dashboard, Auth, Onboarding, Doctors, Medications, Assistant, Profile, ProfileEdit, Symptoms, NotFound, Index, Notifications, MedicationForm } from './src/screens';
import BottomNav from './src/components/BottomNav';
import DevServiceStatusBanner from './src/components/DevServiceStatusBanner';
import awsConfig from './aws-exports';

// Initialize Amplify with AWS configuration
Amplify.configure(awsConfig);

function Shell() {
  const {route} = useRouter();
  const showNav = !['Onboarding', 'Notifications', 'MedicationForm', 'NotFound', 'Index', 'ProfileEdit'].includes(route);
  const {colors, theme, ready} = useTheme();

  if (!ready) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <DevServiceStatusBanner />
      {route === 'Dashboard' && <Dashboard />}
      {route === 'Symptoms' && <Symptoms />}
      {route === 'Medications' && <Medications />}
      {route === 'Profile' && <Profile />}
      {route === 'ProfileEdit' && <ProfileEdit />}
      {route === 'Doctors' && <Doctors />}
      {route === 'Assistant' && <Assistant />}
      {route === 'Auth' && <Auth />}
      {route === 'Onboarding' && <Onboarding />}
      {route === 'Index' && <Index />}
      {route === 'NotFound' && <NotFound />}
      {route === 'Notifications' && <Notifications />}
      {route === 'MedicationForm' && <MedicationForm />}
      {showNav && <BottomNav />}
    </View>
  );
}

export default function App() {
  return (
    <RouterProvider initialRoute="Auth">
      <ThemeProvider>
        <NotificationsProvider>
          <MedicationsProvider>
            <ProfileProvider>
              <Shell />
            </ProfileProvider>
          </MedicationsProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </RouterProvider>
  );
}
