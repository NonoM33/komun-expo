import { create } from 'zustand';
import { Channel, Message } from '../types';
import api from '../services/api';
import { MOCK_CHANNELS, MOCK_MESSAGES } from '../services/mockData';

const DEMO_MODE = true;

interface ChannelsState {
  channels: Channel[];
  currentChannel: Channel | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  currentPage: number;
  hasMoreMessages: boolean;
  pollingInterval: NodeJS.Timeout | null;

  fetchChannels: () => Promise<void>;
  fetchChannel: (id: string) => Promise<void>;
  fetchMessages: (channelId: string, refresh?: boolean) => Promise<void>;
  fetchMoreMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<void>;
  startPolling: (channelId: string) => void;
  stopPolling: () => void;
  clearCurrentChannel: () => void;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  currentChannel: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  isSending: false,
  currentPage: 1,
  hasMoreMessages: true,
  pollingInterval: null,

  fetchChannels: async () => {
    set({ isLoading: true });

    if (DEMO_MODE) {
      set({ channels: MOCK_CHANNELS, isLoading: false });
      return;
    }

    try {
      const channels = await api.getChannels();
      set({ channels, isLoading: false });
    } catch (error) {
      set({ channels: MOCK_CHANNELS, isLoading: false });
    }
  },

  fetchChannel: async (id: string) => {
    if (DEMO_MODE) {
      const channel = MOCK_CHANNELS.find((c) => c.id === id) || null;
      set({ currentChannel: channel });
      return;
    }

    try {
      const channel = await api.getChannel(id);
      set({ currentChannel: channel });
    } catch (error) {
      const channel = MOCK_CHANNELS.find((c) => c.id === id) || null;
      set({ currentChannel: channel });
    }
  },

  fetchMessages: async (channelId: string, refresh = false) => {
    if (refresh) {
      set({ isLoadingMessages: true, currentPage: 1, messages: [] });
    } else {
      set({ isLoadingMessages: true });
    }

    if (DEMO_MODE) {
      const messages = MOCK_MESSAGES.filter((m) => m.channel_id === channelId);
      set({
        messages,
        currentPage: 1,
        hasMoreMessages: false,
        isLoadingMessages: false,
      });
      return;
    }

    try {
      const response = await api.getMessages(channelId, 1);
      set({
        messages: response.data.reverse(),
        currentPage: 1,
        hasMoreMessages: response.meta ? response.meta.current_page < response.meta.total_pages : true,
        isLoadingMessages: false,
      });
    } catch (error) {
      const messages = MOCK_MESSAGES.filter((m) => m.channel_id === channelId);
      set({
        messages,
        currentPage: 1,
        hasMoreMessages: false,
        isLoadingMessages: false,
      });
    }
  },

  fetchMoreMessages: async (channelId: string) => {
    if (DEMO_MODE) return;

    const { isLoadingMessages, hasMoreMessages, currentPage } = get();
    if (isLoadingMessages || !hasMoreMessages) return;

    set({ isLoadingMessages: true });
    try {
      const nextPage = currentPage + 1;
      const response = await api.getMessages(channelId, nextPage);
      set((state) => ({
        messages: [...response.data.reverse(), ...state.messages],
        currentPage: nextPage,
        hasMoreMessages: response.meta ? response.meta.current_page < response.meta.total_pages : response.data.length > 0,
        isLoadingMessages: false,
      }));
    } catch (error) {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (channelId: string, content: string) => {
    set({ isSending: true });

    if (DEMO_MODE) {
      const message: Message = {
        id: String(Date.now()),
        content,
        author: { id: '1', first_name: 'Renaud', last_name: 'Cosson', avatar_url: 'https://i.pravatar.cc/300?img=12' },
        channel_id: channelId,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, message],
        isSending: false,
        channels: state.channels.map((ch) =>
          ch.id === channelId ? { ...ch, last_message: `Renaud: ${content}`, last_message_at: message.created_at } : ch
        ),
      }));
      return;
    }

    try {
      const message = await api.sendMessage(channelId, { content });
      set((state) => ({
        messages: [...state.messages, message],
        isSending: false,
      }));

      // Update channel's last message
      set((state) => ({
        channels: state.channels.map((ch) =>
          ch.id === channelId ? { ...ch, last_message: message } : ch
        ),
      }));
    } catch (error) {
      set({ isSending: false });
      throw error;
    }
  },

  startPolling: (channelId: string) => {
    if (DEMO_MODE) return;

    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await api.getMessages(channelId, 1);
        const newMessages = response.data.reverse();
        const { messages: currentMessages } = get();

        if (newMessages.length > 0) {
          const newOnes = newMessages.filter(
            (m) => !currentMessages.some((cm) => cm.id === m.id)
          );

          if (newOnes.length > 0) {
            set((state) => ({
              messages: [...state.messages, ...newOnes],
            }));
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  clearCurrentChannel: () => {
    get().stopPolling();
    set({ currentChannel: null, messages: [], currentPage: 1, hasMoreMessages: true });
  },
}));
