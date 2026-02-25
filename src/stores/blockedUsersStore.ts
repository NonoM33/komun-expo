import { create } from 'zustand';
import { Block } from '../types';
import api from '../services/api';

const DEMO_MODE = true;

interface BlockedUsersState {
  blockedUsers: Block[];
  blockedUserIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  fetchBlockedUsers: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (blockId: string) => Promise<void>;
  isUserBlocked: (userId: string) => boolean;
}

export const useBlockedUsersStore = create<BlockedUsersState>((set, get) => ({
  blockedUsers: [],
  blockedUserIds: new Set(),
  isLoading: false,
  error: null,

  fetchBlockedUsers: async () => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      set({ blockedUsers: [], blockedUserIds: new Set(), isLoading: false });
      return;
    }

    try {
      const blocks = await api.getBlocks();
      const blockedUserIds = new Set(blocks.map((b) => b.blocked_user_id));
      set({ blockedUsers: blocks, blockedUserIds, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  blockUser: async (userId: string) => {
    if (DEMO_MODE) {
      const newBlock: Block = {
        id: String(Date.now()),
        blocked_user_id: userId,
        blocked_user: {
          id: userId,
          first_name: 'Utilisateur',
          last_name: 'Bloqué',
        },
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        blockedUsers: [...state.blockedUsers, newBlock],
        blockedUserIds: new Set([...state.blockedUserIds, userId]),
      }));
      return;
    }

    try {
      const block = await api.createBlock(userId);
      set((state) => ({
        blockedUsers: [...state.blockedUsers, block],
        blockedUserIds: new Set([...state.blockedUserIds, userId]),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Impossible de bloquer cet utilisateur');
    }
  },

  unblockUser: async (blockId: string) => {
    const block = get().blockedUsers.find((b) => b.id === blockId);
    if (!block) return;

    if (DEMO_MODE) {
      set((state) => {
        const newBlockedUserIds = new Set(state.blockedUserIds);
        newBlockedUserIds.delete(block.blocked_user_id);
        return {
          blockedUsers: state.blockedUsers.filter((b) => b.id !== blockId),
          blockedUserIds: newBlockedUserIds,
        };
      });
      return;
    }

    try {
      await api.deleteBlock(blockId);
      set((state) => {
        const newBlockedUserIds = new Set(state.blockedUserIds);
        newBlockedUserIds.delete(block.blocked_user_id);
        return {
          blockedUsers: state.blockedUsers.filter((b) => b.id !== blockId),
          blockedUserIds: newBlockedUserIds,
        };
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Impossible de débloquer cet utilisateur');
    }
  },

  isUserBlocked: (userId: string) => {
    return get().blockedUserIds.has(userId);
  },
}));
