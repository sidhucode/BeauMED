import React, {createContext, useCallback, useContext, useMemo, useState, useEffect} from 'react';
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
          return await fetch('https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/medications', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        },
        'us-east-1'
      );

      const data = await response.json() as any;
      console.log('📋 Fetched medications:', data);

      // Handle both direct response and wrapped response
      if (data.medications) {
        setItems(data.medications);
      } else if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
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
          return await fetch('https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/medications', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        },
        'us-east-1'
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
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
          return await fetch(`https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/medications/${medicationId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        },
        'us-east-1'
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
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
          return await fetch(`https://dchf2ja7ti.execute-api.us-east-1.amazonaws.com/dev/medications/${medicationId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        },
        'us-east-1'
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
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

