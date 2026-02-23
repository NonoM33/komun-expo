import { create } from 'zustand';
import { Resident } from '../types';
import api from '../services/api';
import { MOCK_RESIDENTS } from '../services/mockData';

const DEMO_MODE = true;

interface ResidentsState {
  residents: Resident[];
  filteredResidents: Resident[];
  isLoading: boolean;
  searchQuery: string;
  error: string | null;

  fetchResidents: () => Promise<void>;
  search: (query: string) => void;
  clearSearch: () => void;
}

export const useResidentsStore = create<ResidentsState>((set, get) => ({
  residents: [],
  filteredResidents: [],
  isLoading: false,
  searchQuery: '',
  error: null,

  fetchResidents: async () => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      set({
        residents: MOCK_RESIDENTS,
        filteredResidents: MOCK_RESIDENTS,
        isLoading: false,
      });
      return;
    }

    try {
      const residents = await api.getResidents();
      set({
        residents,
        filteredResidents: residents,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        residents: MOCK_RESIDENTS,
        filteredResidents: MOCK_RESIDENTS,
        isLoading: false,
      });
    }
  },

  search: (query: string) => {
    const { residents } = get();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      set({ searchQuery: '', filteredResidents: residents });
      return;
    }

    const filtered = residents.filter((resident) => {
      const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
      const apartment = (resident.apartment || resident.apartment_number || '').toLowerCase();
      const floor = String(resident.floor || '').toLowerCase();

      return (
        fullName.includes(normalizedQuery) ||
        apartment.includes(normalizedQuery) ||
        floor.includes(normalizedQuery)
      );
    });

    set({ searchQuery: query, filteredResidents: filtered });
  },

  clearSearch: () => {
    const { residents } = get();
    set({ searchQuery: '', filteredResidents: residents });
  },
}));
