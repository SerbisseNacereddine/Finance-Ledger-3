import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type CurrencyCode = 'DZD' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'MAD' | 'TND';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'DZD', name: 'Algerian Dinar',   symbol: 'DA' },
  { code: 'USD', name: 'US Dollar',        symbol: '$'  },
  { code: 'EUR', name: 'Euro',             symbol: '€'  },
  { code: 'GBP', name: 'British Pound',    symbol: '£'  },
  { code: 'SAR', name: 'Saudi Riyal',      symbol: '﷼'  },
  { code: 'MAD', name: 'Moroccan Dirham',  symbol: 'MAD'},
  { code: 'TND', name: 'Tunisian Dinar',   symbol: 'TND'},
];

const STORAGE_KEY = '@money_manager_currency';

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCIES[0]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        const found = CURRENCIES.find((c) => c.code === val);
        if (found) setCurrencyState(found);
      }
    });
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (!found) return;
    setCurrencyState(found);
    AsyncStorage.setItem(STORAGE_KEY, code);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
