import { create } from 'zustand';
import { NFT, Order } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

interface StoreState {
  nfts: NFT[];
  orders: Order[];
  pendingBurn: number;
  burnedAmount: number;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addNFT: (nft: Omit<NFT, 'id' | 'soldCount'>) => void;
  updateNFT: (id: string, updates: Partial<NFT>) => void;
  deleteNFT: (id: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updatePendingBurn: (amount: number) => void;
  updateBurnedAmount: (amount: number) => void;
  loadInitialData: () => Promise<void>;
  saveData: () => Promise<void>;
  formatPrice: (price: number) => string;
}

export const useStore = create<StoreState>((set, get) => ({
  nfts: [],
  orders: [],
  pendingBurn: 0,
  burnedAmount: 0,
  isAuthenticated: false,
  login: (username, password) => {
    if (username === 'PlanC' && password === 'Ceyhun8387@') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),
  addNFT: (nft) => {
    const newNFT: NFT = { id: uuidv4(), soldCount: 0, ...nft };
    set((state) => ({ nfts: [...state.nfts, newNFT] }));
  },
  updateNFT: (id, updates) => {
    set((state) => ({
      nfts: state.nfts.map((nft) => (nft.id === id ? { ...nft, ...updates } : nft)),
    }));
  },
  deleteNFT: (id) => {
    set((state) => ({ nfts: state.nfts.filter((nft) => nft.id !== id) }));
  },
  addOrder: async (order) => {
    const newOrder: Order = { id: uuidv4(), ...order };
    set((state) => ({ orders: [...state.orders, newOrder] }));
    await supabase.from('nft_orders').insert([newOrder]);
  },
  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, ...updates } : order)),
    }));
  },
  updatePendingBurn: (amount) => {
    set((state) => ({ pendingBurn: state.pendingBurn + amount }));
  },
  updateBurnedAmount: (amount) => {
    set({ burnedAmount: amount });
  },
  loadInitialData: async () => {
    try {
      const { data: nftData, error: nftError } = await supabase
  .from('nft_items')
  .select('*')
  .order('title', { ascending: true });

      const { data: ordersData, error: ordersError } = await supabase.from('nft_orders').select('*');

      if (nftError || ordersError) {
        console.error('Supabase veri çekme hatası:', nftError || ordersError);
        return;
      }

      set({
        nfts: nftData || [],
        orders: ordersData || [],
        pendingBurn: 0,
        burnedAmount: 0,
      });
    } catch (error) {
      console.error('Supabase genel hata:', error);
    }
  },
  saveData: async () => {
    console.log('Supabase yapısı aktif, saveData devre dışı.');
  },
  formatPrice: (price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },
}));
