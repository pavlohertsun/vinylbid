export type UserRole = 'buyer' | 'seller' | 'admin';
export type GoldmineCondition = 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G' | 'F' | 'P';
export type VinylFormat = '12"' | '7"' | '10"';
export type AuctionType = 'dutch' | 'vickrey';
export type LotStatus = 'draft' | 'pending' | 'active' | 'sold' | 'unsold';
export type AuctionStatus = 'pending' | 'active' | 'ended';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  rating: number;
  ratingCount: number;
  joinedAt: string;
}

export interface VinylRecord {
  id: number;
  artist: string;
  title: string;
  year: number;
  label: string;
  condition: GoldmineCondition;
  conditionNote: string;
  format: VinylFormat;
  genre: string;
  description: string;
  labelColor: string;
}

export interface Lot {
  id: number;
  recordId: number;
  sellerId: number;
  status: LotStatus;
  auctionType: AuctionType;
  startPrice: number;
  reservePrice: number;
  priceDecreasePerMinute?: number;
  durationMinutes: number;
  createdAt: string;
  rejectionReason?: string;
}

export interface Auction {
  id: number;
  lotId: number;
  type: AuctionType;
  startPrice: number;
  reservePrice: number;
  priceDecreasePerMinute?: number;
  startTime: number;
  endTime: number;
  status: AuctionStatus;
  winnerId?: number;
  finalPrice?: number;
}

export interface Bid {
  id: number;
  auctionId: number;
  userId: number;
  amount: number;
  placedAt: number;
}
