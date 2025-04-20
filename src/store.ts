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
  deleteOrder: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
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
    const newNFT: NFT = {
      id: uuidv4(),
      soldCount: 0,
      ...nft,
    };
    set((state) => ({ nfts: [...state.nfts, newNFT] }));
    supabase.from('nft_items').insert([newNFT]); // async değil, beklenmiyor
  },

  updateNFT: (id, updates) => {
    set((state) => ({
      nfts: state.nfts.map((nft) => (nft.id === id ? { ...nft, ...updates } : nft)),
    }));
    supabase.from('nft_items').update(updates).eq('id', id);
  },

  deleteNFT: (id) => {
    set((state) => ({ nfts: state.nfts.filter((nft) => nft.id !== id) }));
    supabase.from('nft_items').delete().eq('id', id);
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
    supabase.from('nft_orders').delete().eq('id', id);
  },


  addOrder: (order) => {
    const newOrder: Order = { id: uuidv4(), ...order };
    set((state) => ({ orders: [...state.orders, newOrder] }));
    supabase.from('nft_orders').insert([newOrder]);
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, ...updates } : order)),
    }));
    supabase.from('nft_orders').update(updates).eq('id', id);
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

      const { data: ordersData, error: ordersError } = await supabase
          .from('nft_orders')
          .select('*')
          .order('purchaseDate', { ascending: false });

      if (nftError || ordersError) {
        console.error('Veri çekme hatası:', nftError || ordersError);
        return;
      }

      set({
        nfts: (nftData as NFT[]) || [],
        orders: (ordersData as Order[]) || [],
        pendingBurn: 0,
        burnedAmount: 0,
      });
    } catch (error) {
      console.error('loadInitialData genel hata:', error);
    }
  },

  saveData: async () => {
    console.log('Supabase ile çalışılıyor, saveData gerekli değil.');
  },

  formatPrice: (price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },
}));
