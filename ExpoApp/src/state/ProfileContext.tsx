import React, {createContext, useContext, useMemo, useState, useCallback} from 'react';

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
};

const initialProfile: Profile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: '45',
  conditions: 'Diabetes, Hypertension',
  caregiverName: 'Jane Doe',
  caregiverPhone: '(555) 123-4567',
  caregiverEmail: 'jane.doe@example.com',
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({children}: {children: React.ReactNode}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile(prev => ({...prev, ...updates}));
  }, []);

  const value = useMemo(() => ({profile, updateProfile}), [profile, updateProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
