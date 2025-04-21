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
  addNFT: (nft: Omit<NFT, 'id' | 'soldCount'>) => Promise<void>;
  updateNFT: (id: string, updates: Partial<NFT>) => Promise<void>;
  deleteNFT: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  incrementSoldCount: (id: string) => Promise<void>; // <-- 🔥 Bunu ekledik
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

  addNFT: async (nft) => {
    const newNFT: NFT = {
      id: uuidv4(),
      soldCount: 0,
      ...nft,
    };
    set((state) => ({ nfts: [...state.nfts, newNFT] }));
    const { error } = await supabase.from('nft_items').insert([newNFT]);
    if (error) console.error('NFT ekleme hatası:', error);
  },

  updateNFT: async (id, updates) => {
    set((state) => ({
      nfts: state.nfts.map((nft) => (nft.id === id ? { ...nft, ...updates } : nft)),
    }));
    const { error } = await supabase.from('nft_items').update(updates).eq('id', id);
    if (error) console.error('NFT güncelleme hatası:', error);
  },

  deleteNFT: async (id) => {
    set((state) => ({ nfts: state.nfts.filter((nft) => nft.id !== id) }));
    const { error } = await supabase.from('nft_items').delete().eq('id', id);
    if (error) console.error('NFT silme hatası:', error);
  },

  deleteOrder: async (id) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
    const { error } = await supabase.from('nft_orders').delete().eq('id', id);
    if (error) console.error('Sipariş silme hatası:', error);
  },

  addOrder: async (order) => {
    const newOrder: Order = { id: uuidv4(), ...order };
    set((state) => ({ orders: [...state.orders, newOrder] }));
    const { error } = await supabase.from('nft_orders').insert([newOrder]);
    if (error) console.error('Sipariş ekleme hatası:', error);
  },

  updateOrder: async (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, ...updates } : order)),
    }));
    const { error } = await supabase.from('nft_orders').update(updates).eq('id', id);
    if (error) console.error('Sipariş güncelleme hatası:', error);
  },

  // 🔥 Yeni fonksiyon burada
  incrementSoldCount: async (id) => {
    const currentNFT = get().nfts.find((n) => n.id === id);
    if (!currentNFT) return;
    const newSoldCount = currentNFT.soldCount + 1;

    set((state) => ({
      nfts: state.nfts.map((n) =>
          n.id === id ? { ...n, soldCount: newSoldCount } : n
      ),
    }));

    const { error } = await supabase.from('nft_items').update({ soldCount: newSoldCount }).eq('id', id);
    if (error) console.error('soldCount güncellenemedi:', error);
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
