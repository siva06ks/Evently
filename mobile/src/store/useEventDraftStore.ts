import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type EventDraftState = {
  title: string;
  organizerEmail: string;
  date: string;
  setField: (field: "title" | "organizerEmail" | "date", value: string) => void;
  reset: () => void;
};

const initialState = {
  title: "",
  organizerEmail: "",
  date: "",
};

export const useEventDraftStore = create<EventDraftState>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (field, value) => set((state) => ({ ...state, [field]: value })),
      reset: () => set(initialState),
    }),
    {
      name: "evently-draft",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
