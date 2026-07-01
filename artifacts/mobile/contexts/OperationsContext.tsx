import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { Operation } from '@/types';

const STORAGE_KEY = '@money_manager_operations';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

interface OperationsContextValue {
  operations: Operation[];
  isLoading: boolean;
  addOperation: (op: Omit<Operation, 'id'>) => Promise<void>;
  updateOperation: (op: Operation) => Promise<void>;
  deleteOperation: (id: string) => Promise<void>;
}

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({ children }: { children: React.ReactNode }) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Operation[];
          setOperations(parsed);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (ops: Operation[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
  }, []);

  const addOperation = useCallback(
    async (op: Omit<Operation, 'id'>) => {
      const newOp: Operation = { ...op, id: generateId() };
      const updated = [newOp, ...operations];
      setOperations(updated);
      await persist(updated);
    },
    [operations, persist]
  );

  const updateOperation = useCallback(
    async (op: Operation) => {
      const updated = operations.map((o) => (o.id === op.id ? op : o));
      setOperations(updated);
      await persist(updated);
    },
    [operations, persist]
  );

  const deleteOperation = useCallback(
    async (id: string) => {
      const updated = operations.filter((o) => o.id !== id);
      setOperations(updated);
      await persist(updated);
    },
    [operations, persist]
  );

  return (
    <OperationsContext.Provider
      value={{ operations, isLoading, addOperation, updateOperation, deleteOperation }}
    >
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations(): OperationsContextValue {
  const ctx = useContext(OperationsContext);
  if (!ctx) throw new Error('useOperations must be used within OperationsProvider');
  return ctx;
}
