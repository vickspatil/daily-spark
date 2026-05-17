import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiProvider = "claude" | "gemini";

interface AppState {
  hasCompletedOnboarding: boolean;
  apiProvider: ApiProvider;
  apiKey: string;
  selectedTopics: string[];
  dailyMinutes: number;
  notificationsEnabled: boolean;
  notificationTime: { hour: number; minute: number };
  briefTopics: string[];

  completeOnboarding: () => void;
  setApiConfig: (provider: ApiProvider, key: string) => void;
  setSelectedTopics: (topics: string[]) => void;
  setDailyMinutes: (min: number) => void;
  setNotificationTime: (hour: number, minute: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setBriefTopics: (topics: string[]) => void;
  resetOnboarding: () => void;
}

const initial = {
  hasCompletedOnboarding: false,
  apiProvider: "claude" as ApiProvider,
  apiKey: "",
  selectedTopics: [] as string[],
  dailyMinutes: 10,
  notificationsEnabled: false,
  notificationTime: { hour: 8, minute: 0 },
  briefTopics: [] as string[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setApiConfig: (apiProvider, apiKey) => set({ apiProvider, apiKey }),
      setSelectedTopics: (selectedTopics) => set({ selectedTopics }),
      setDailyMinutes: (dailyMinutes) => set({ dailyMinutes }),
      setNotificationTime: (hour, minute) =>
        set({ notificationTime: { hour, minute } }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      setBriefTopics: (briefTopics) => set({ briefTopics }),
      resetOnboarding: () => {
        try {
          // wipe all brief storage
          Object.keys(localStorage)
            .filter((k) => k.startsWith("brief_") || k.startsWith("dailybrief_"))
            .forEach((k) => localStorage.removeItem(k));
        } catch {}
        set({ ...initial });
      },
    }),
    {
      name: "dailybrief_prefs",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);

/** Convenience for SSR-safe client-only reads */
export function useHydrated() {
  if (typeof window === "undefined") return false;
  return true;
}
