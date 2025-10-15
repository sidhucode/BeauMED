import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View } from 'react-native';
import { RouterProvider, useRouter } from './src/navigation/SimpleRouter';
import { Dashboard, Auth, Onboarding, Doctors, Medications, Assistant, Profile, Symptoms, NotFound, Index } from './src/screens';
import BottomNav from './src/components/BottomNav';

function Shell() {
  const isDarkMode = useColorScheme() === 'dark';
  const {route} = useRouter();
  return (
    <View style={{flex: 1, backgroundColor: isDarkMode ? '#0b1020' : '#f7f7fb'}}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {route === 'Dashboard' && <Dashboard />}
      {route === 'Symptoms' && <Symptoms />}
      {route === 'Medications' && <Medications />}
      {route === 'Profile' && <Profile />}
      {route === 'Doctors' && <Doctors />}
      {route === 'Assistant' && <Assistant />}
      {route === 'Auth' && <Auth />}
      {route === 'Onboarding' && <Onboarding />}
      {route === 'Index' && <Index />}
      {route === 'NotFound' && <NotFound />}
      <BottomNav />
    </View>
  );
}

export default function App() {
  return (
    <RouterProvider initialRoute="Dashboard">
      <Shell />
    </RouterProvider>
  );
}
