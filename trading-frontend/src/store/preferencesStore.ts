import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type CurrencyPreference = 'USD' | 'EUR';

interface PreferencesState {
  theme: ThemePreference;
  currency: CurrencyPreference;
  notificationsEnabled: boolean;
  setTheme: (theme: ThemePreference) => void;
  setCurrency: (currency: CurrencyPreference) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: 'system',
  currency: 'USD',
  notificationsEnabled: true,
  setTheme: (theme) => set({ theme }),
  setCurrency: (currency) => set({ currency }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));
