export interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  priceXEP?: number;
  mintCount: number;
  soldCount: number;
  creator?: string;
}

export interface Order {
  id: string;
  nftTitle: string;
  customer: string;
  walletAddress: string;
  purchaseDate: string;
  status: string;
  nftId?: string;
}
