import { create } from 'zustand';
import { client } from '../main';
import type { IEvents } from '../models/event';

interface IAuthState {
  readonly username: string;
  readonly userId: string;
}

interface IEventsState {
  readonly events: IEvents;
  readonly loading: boolean;
  readonly error?: Error;

  readonly getEvents: () => Promise<void>;
}

export const useAuthStore = create<IAuthState>((set) => ({
  username: '',
  userId: '',

  setUser: async (username: string, userId: string) => {
    set({ username, userId });
  },
}));

export const useEventsStore = create<IEventsState>((set) => ({
  events: {} as IEvents,
  loading: false,
  error: undefined,

  getEvents: async () => {
    try {
      const events = await client.getEvents();
      set({ events });
    } catch (error) {
      set({ error: error as Error });
    }
  },
}));
