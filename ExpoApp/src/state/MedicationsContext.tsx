import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';

export type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  reminder: boolean;
};

type Ctx = {
  items: Medication[];
  addMedication: (payload: Omit<Medication, 'id'>) => void;
  updateMedication: (id: number, payload: Partial<Omit<Medication, 'id'>>) => void;
  removeMedication: (id: number) => void;
  toggleReminder: (id: number, value: boolean) => void;
};

const MedicationsContext = createContext<Ctx | undefined>(undefined);

const seed: Medication[] = [
  {id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextDose: '8:00 AM', reminder: true},
  {id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', nextDose: '2:00 PM', reminder: true},
  {id: 3, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', nextDose: '9:00 PM', reminder: false},
];

export function MedicationsProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<Medication[]>(seed);
  const [nextId, setNextId] = useState(seed.length + 1);

  const addMedication = useCallback((payload: Omit<Medication, 'id'>) => {
    setItems(prev => [...prev, {id: nextId, ...payload}]);
    setNextId(n => n + 1);
  }, [nextId]);

  const updateMedication = useCallback((id: number, payload: Partial<Omit<Medication, 'id'>>) => {
    setItems(prev => prev.map(item => (item.id === id ? {...item, ...payload} : item)));
  }, []);

  const removeMedication = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleReminder = useCallback((id: number, value: boolean) => {
    setItems(prev => prev.map(item => (item.id === id ? {...item, reminder: value} : item)));
  }, []);

  const value = useMemo<Ctx>(() => ({
    items,
    addMedication,
    updateMedication,
    removeMedication,
    toggleReminder,
  }), [items, addMedication, updateMedication, removeMedication, toggleReminder]);

  return <MedicationsContext.Provider value={value}>{children}</MedicationsContext.Provider>;
}

export function useMedications() {
  const ctx = useContext(MedicationsContext);
  if (!ctx) {
    throw new Error('useMedications must be used within MedicationsProvider');
  }
  return ctx;
}

