import { create } from 'zustand';
import type { Listing, ListingFilter, ListingCategory } from '../types/listing';

interface ListingsStore {
  listings: Listing[];
  filteredListings: Listing[];
  activeCategory: ListingCategory | null;
  filters: ListingFilter;
  searchQuery: string;
  isLoading: boolean;
  setListings: (listings: Listing[]) => void;
  setActiveCategory: (category: ListingCategory | null) => void;
  setFilters: (filters: ListingFilter) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  applyFilters: () => void;
}

export const useListingsStore = create<ListingsStore>((set, get) => ({
  listings: [],
  filteredListings: [],
  activeCategory: null,
  filters: {},
  searchQuery: '',
  isLoading: false,
  setListings: (listings) => set({ listings, filteredListings: listings }),
  setActiveCategory: (activeCategory) => {
    set({ activeCategory });
    get().applyFilters();
  },
  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().applyFilters();
  },
  setLoading: (isLoading) => set({ isLoading }),
  applyFilters: () => {
    const { listings, activeCategory, filters, searchQuery } = get();
    let result = [...listings];

    if (activeCategory) {
      result = result.filter((l) => l.category === activeCategory);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter((l) => l.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((l) => l.price <= filters.maxPrice!);
    }
    if (filters.location) {
      result = result.filter((l) =>
        l.location.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    }
    if (filters.state) {
      result = result.filter((l) =>
        l.state.toLowerCase().includes(filters.state!.toLowerCase()),
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }

    set({ filteredListings: result });
  },
}));
