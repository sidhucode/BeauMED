/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StatusBar, useColorScheme, View} from 'react-native';
import {RouterProvider, useRouter} from './src/navigation/SimpleRouter';
import {Dashboard, GenericScreen} from './src/screens';
import BottomNav from './src/components/BottomNav';

function Shell() {
  const isDarkMode = useColorScheme() === 'dark';
  const {route} = useRouter();

  return (
    <View style={{flex: 1, backgroundColor: isDarkMode ? '#0b1020' : '#f7f7fb'}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {route === 'Dashboard' && <Dashboard />}
      {route === 'Symptoms' && <GenericScreen title="Symptoms" subtitle="Track and log symptoms" />}
      {route === 'Medications' && <GenericScreen title="Medications" subtitle="Manage your meds" />}
      {route === 'Profile' && <GenericScreen title="Profile" subtitle="View and update profile" />}
      {route === 'Doctors' && <GenericScreen title="Doctors" subtitle="Find and manage doctors" />}
      {route === 'Assistant' && <GenericScreen title="AI Assistant" subtitle="Ask questions and get help" />}
      {route === 'Auth' && <GenericScreen title="Auth" subtitle="Sign in / Sign up" />}
      {route === 'Onboarding' && <GenericScreen title="Onboarding" subtitle="Get started" />}
      {route === 'Index' && <GenericScreen title="Welcome" subtitle="Blank landing" />}
      {route === 'NotFound' && <GenericScreen title="Not Found" subtitle="This page is not available" />}
      <BottomNav />
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <RouterProvider initialRoute="Dashboard">
      <Shell />
    </RouterProvider>
  );
}
