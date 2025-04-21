import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useStore } from './store';
import { supabase } from './supabaseClient';
import { NFT, Order } from './types';

function Root() {
    const {
        loadInitialData,
        updateNFT,
        addNFT,
        deleteNFT,
        addOrder,
        updateOrder,
        deleteOrder,
    } = useStore();

    const setupSupabaseRealtime = () => {
        const nftChannel = supabase
            .channel('realtime-nft-items')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nft_items' },
                (payload: { eventType: string; old: Partial<NFT>; new: Partial<NFT> }) => {
                    const id = payload.old?.id ?? payload.new?.id;
                    if (!id) return;

                    if (payload.eventType === 'INSERT' && payload.new) addNFT(payload.new as NFT);
                    else if (payload.eventType === 'UPDATE' && payload.new) updateNFT(id, payload.new as NFT);
                    else if (payload.eventType === 'DELETE') deleteNFT(id);
                }
            )
            .subscribe();

        const orderChannel = supabase
            .channel('realtime-nft-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nft_orders' },
                (payload: { eventType: string; old: Partial<Order>; new: Partial<Order> }) => {
                    const id = payload.old?.id ?? payload.new?.id;
                    if (!id) return;

                    if (payload.eventType === 'INSERT' && payload.new) addOrder(payload.new as Order);
                    else if (payload.eventType === 'UPDATE' && payload.new) updateOrder(id, payload.new as Order);
                    else if (payload.eventType === 'DELETE') deleteOrder(id);
                }
            )
            .subscribe();

        return () => {
            nftChannel.unsubscribe();
            orderChannel.unsubscribe();
        };
    };

    useEffect(() => {
        loadInitialData();
        const cleanup = setupSupabaseRealtime();
        return cleanup;
    }, []);

    return <App />;
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Root />
    </StrictMode>
);
