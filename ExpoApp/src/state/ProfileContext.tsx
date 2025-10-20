import React, {createContext, useContext, useMemo, useState, useCallback} from 'react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

type Profile = {
  name: string;
  email: string;
  age: string;
  conditions: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverEmail: string;
};

type ProfileContextValue = {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  saveProfile: (updates: Partial<Profile>) => Promise<void>;
  loadUserProfile: () => Promise<void>;
  clearProfile: () => void;
};

const initialProfile: Profile = {
  name: '',
  email: '',
  age: '',
  conditions: '',
  caregiverName: '',
  caregiverPhone: '',
  caregiverEmail: '',
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({children}: {children: React.ReactNode}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile(prev => ({...prev, ...updates}));
  }, []);

  const saveProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      // Update Cognito user attributes
      // Note: Cognito only supports standard attributes (name, email, etc.)
      // Custom attributes need to be prefixed with 'custom:'
      const cognitoAttributes: Record<string, string> = {};

      if (updates.name) {
        cognitoAttributes.name = updates.name;
      }

      // Store other fields as custom attributes
      if (updates.age) {
        cognitoAttributes['custom:age'] = updates.age;
      }
      if (updates.conditions) {
        cognitoAttributes['custom:conditions'] = updates.conditions;
      }
      if (updates.caregiverName) {
        cognitoAttributes['custom:caregiver_name'] = updates.caregiverName;
      }
      if (updates.caregiverPhone) {
        cognitoAttributes['custom:caregiver_phone'] = updates.caregiverPhone;
      }
      if (updates.caregiverEmail) {
        cognitoAttributes['custom:caregiver_email'] = updates.caregiverEmail;
      }

      await updateUserAttributes({
        userAttributes: cognitoAttributes,
      });

      console.log('✅ Profile updated in Cognito');

      // Update local state
      setProfile(prev => ({...prev, ...updates}));

      // Reload profile to ensure sync
      await loadUserProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const attributes = await fetchUserAttributes();
      console.log('📋 Fetched user attributes:', attributes);

      setProfile(prev => ({
        ...prev,
        name: attributes.name || '',
        email: attributes.email || '',
        age: (attributes['custom:age'] as string) || '',
        conditions: (attributes['custom:conditions'] as string) || '',
        caregiverName: (attributes['custom:caregiver_name'] as string) || '',
        caregiverPhone: (attributes['custom:caregiver_phone'] as string) || '',
        caregiverEmail: (attributes['custom:caregiver_email'] as string) || '',
      }));
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(initialProfile);
  }, []);

  const value = useMemo(() => ({profile, updateProfile, saveProfile, loadUserProfile, clearProfile}), [profile, updateProfile, saveProfile, loadUserProfile, clearProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
