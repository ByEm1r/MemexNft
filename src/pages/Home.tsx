import React, { useEffect, useState } from 'react';
import { NFTCard } from '../components/NFTCard';
import { Lightbulb, Gem, Code } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const Home: React.FC = () => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchNFTs = async () => {
      const { data, error } = await supabase.from('nft_items').select('*');
      if (error) {
        console.error('NFT verisi alınamadı:', error);
      } else {
        setNfts(
            (data || []).sort((a, b) => {
              const aNum = parseInt(a.title.match(/\d+/)[0]);
              const bNum = parseInt(b.title.match(/\d+/)[0]);
              return aNum - bNum;
            })
        );
      }
    };

    fetchNFTs();

    const channel = supabase
        .channel('realtime:nft_orders')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'nft_orders' },
            (payload) => {
              console.log('💥 Supabase Realtime güncelleme:', payload);
              fetchNFTs();
              setMessage('Supabase güncellemesi alındı!');
            }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto p-6 rounded-lg shadow-xl bg-gray-800">
          <section className="mb-12 relative">
            <div className="relative overflow-hidden" style={{ height: '312.5px', marginBottom: '2rem' }}>
              <img
                  src="https://cdn.glitch.global/98864b85-1f3e-4005-b562-c76cd00dd9d3/nft.jpg"
                  alt="NFT Concept"
                  className="w-full h-full object-cover absolute transition-transform duration-500 hover:scale-110"
                  style={{
                    objectFit: 'cover',
                    height: '625px',
                    marginTop: '-156.25px',
                    marginBottom: '-156.25px',
                  }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute bottom-0 right-0 p-4 text-right text-white">
                <p className="text-sm italic">MemeX NFT</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-white text-center">
                <Lightbulb className="mx-auto h-12 w-12 mb-4 text-emerald-500" />
                <h3 className="text-xl font-semibold mb-2">Digital Ownership</h3>
                <p className="text-gray-400">NFTs represent unique digital assets, proving ownership of items like art, music, and more.</p>
              </div>

              <div className="text-white text-center">
                <Gem className="mx-auto h-12 w-12 mb-4 text-emerald-500" />
                <h3 className="text-xl font-semibold mb-2">Unique & Collectible</h3>
                <p className="text-gray-400">Each NFT is one-of-a-kind, making them valuable collectibles in the digital world.</p>
              </div>

              <div className="text-white text-center">
                <Code className="mx-auto h-12 w-12 mb-4 text-emerald-500" />
                <h3 className="text-xl font-semibold mb-2">Blockchain Secured</h3>
                <p className="text-gray-400">NFTs are secured using blockchain technology, ensuring authenticity and preventing fraud.</p>
              </div>
            </div>
          </section>

          <h2 className="text-3xl font-bold text-white mb-8">Marketplace</h2>
          <div>
            <p className="text-white">{message}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      </div>
  );
};
