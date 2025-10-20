import React, {createContext, useCallback, useContext, useMemo, useState, useEffect} from 'react';
import { get, post, put, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { monitoredAPICall } from '../utils/awsServiceHealth';

export type Medication = {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  reminders: string[];
  startDate?: string;
  endDate?: string;
  notes?: string;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
};

type Ctx = {
  items: Medication[];
  loading: boolean;
  addMedication: (payload: Omit<Medication, 'medicationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedication: (medicationId: string, payload: Partial<Omit<Medication, 'medicationId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  removeMedication: (medicationId: string) => Promise<void>;
  refreshMedications: () => Promise<void>;
};

const MedicationsContext = createContext<Ctx | undefined>(undefined);

export function MedicationsProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthToken = async () => {
    const session = await fetchAuthSession();
    return session?.tokens?.idToken?.toString();
  };

  const refreshMedications = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await monitoredAPICall(
        'API_GATEWAY',
        async () => {
          return await get({
            apiName: 'beaumedApi',
            path: '/medications',
            options: {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            },
          }).response;
        },
        'us-east-1'
      );

      const data = await response.body.json() as any;
      console.log('📋 Fetched medications:', data);

      setItems(data.medications || []);
    } catch (error) {
      console.error('Failed to load medications:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMedication = useCallback(async (payload: Omit<Medication, 'medicationId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await monitoredAPICall(
        'API_GATEWAY',
        async () => {
          return await post({
            apiName: 'beaumedApi',
            path: '/medications',
            options: {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: payload,
            },
          }).response;
        },
        'us-east-1'
      );

      const data = await response.body.json() as any;
      console.log('✅ Medication created:', data);

      // Refresh the list
      await refreshMedications();
    } catch (error) {
      console.error('Failed to create medication:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMedications]);

  const updateMedication = useCallback(async (medicationId: string, payload: Partial<Omit<Medication, 'medicationId' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await monitoredAPICall(
        'API_GATEWAY',
        async () => {
          return await put({
            apiName: 'beaumedApi',
            path: `/medications/${medicationId}`,
            options: {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: payload,
            },
          }).response;
        },
        'us-east-1'
      );

      const data = await response.body.json() as any;
      console.log('✅ Medication updated:', data);

      // Refresh the list
      await refreshMedications();
    } catch (error) {
      console.error('Failed to update medication:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMedications]);

  const removeMedication = useCallback(async (medicationId: string) => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await monitoredAPICall(
        'API_GATEWAY',
        async () => {
          return await del({
            apiName: 'beaumedApi',
            path: `/medications/${medicationId}`,
            options: {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            },
          }).response;
        },
        'us-east-1'
      );

      const data = await response.body.json() as any;
      console.log('✅ Medication deleted:', data);

      // Refresh the list
      await refreshMedications();
    } catch (error) {
      console.error('Failed to delete medication:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMedications]);

  const value = useMemo<Ctx>(() => ({
    items,
    loading,
    addMedication,
    updateMedication,
    removeMedication,
    refreshMedications,
  }), [items, loading, addMedication, updateMedication, removeMedication, refreshMedications]);

  // Load medications on mount
  useEffect(() => {
    refreshMedications();
  }, [refreshMedications]);

  return <MedicationsContext.Provider value={value}>{children}</MedicationsContext.Provider>;
}

export function useMedications() {
  const ctx = useContext(MedicationsContext);
  if (!ctx) {
    throw new Error('useMedications must be used within MedicationsProvider');
  }
  return ctx;
}

