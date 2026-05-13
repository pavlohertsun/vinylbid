import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lot, Auction, Bid, VinylRecord, AuctionType, GoldmineCondition, VinylFormat } from '../types';
import { INITIAL_LOTS, INITIAL_AUCTIONS, INITIAL_BIDS, INITIAL_RECORDS } from '../data/mockData';

interface CreateLotInput {
  artist: string; title: string; year: number; label: string;
  condition: GoldmineCondition; conditionNote: string;
  format: VinylFormat; genre: string; description: string;
  auctionType: AuctionType;
  startPrice: number; reservePrice: number;
  priceDecreasePerMinute?: number;
  durationMinutes: number;
  sellerId: number;
}

interface AppContextType {
  lots: Lot[];
  auctions: Auction[];
  bids: Bid[];
  records: VinylRecord[];
  approveLot: (lotId: number) => void;
  rejectLot: (lotId: number, reason: string) => void;
  placeBid: (auctionId: number, userId: number, amount: number) => boolean;
  buyNow: (auctionId: number, userId: number) => void;
  endAuction: (auctionId: number) => void;
  createLot: (input: CreateLotInput) => void;
  getDutchCurrentPrice: (auction: Auction) => number;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>(INITIAL_LOTS);
  const [auctions, setAuctions] = useState<Auction[]>(INITIAL_AUCTIONS);
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS);
  const [records, setRecords] = useState<VinylRecord[]>(INITIAL_RECORDS);

  const getDutchCurrentPrice = (auction: Auction): number => {
    if (auction.type !== 'dutch') return auction.startPrice;
    const elapsed = (Date.now() - auction.startTime) / 60_000;
    const price = auction.startPrice - (auction.priceDecreasePerMinute ?? 0) * elapsed;
    return Math.max(Math.round(price), auction.reservePrice);
  };

  const approveLot = (lotId: number) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;
    const now = Date.now();
    const newAuction: Auction = {
      id: now,
      lotId,
      type: lot.auctionType,
      startPrice: lot.startPrice,
      reservePrice: lot.reservePrice,
      priceDecreasePerMinute: lot.priceDecreasePerMinute,
      startTime: now,
      endTime: now + lot.durationMinutes * 60_000,
      status: 'active',
    };
    setLots(prev => prev.map(l => l.id === lotId ? { ...l, status: 'active' } : l));
    setAuctions(prev => [...prev, newAuction]);

    // Auto-bids simulation for Vickrey
    if (lot.auctionType === 'vickrey') {
      setTimeout(() => {
        setBids(prev => [...prev, { id: Date.now(), auctionId: now, userId: 4, amount: Math.round(lot.startPrice * 1.1), placedAt: Date.now() }]);
      }, 3000);
      setTimeout(() => {
        setBids(prev => [...prev, { id: Date.now() + 1, auctionId: now, userId: 5, amount: Math.round(lot.startPrice * 1.25), placedAt: Date.now() }]);
      }, 7000);
    }
  };

  const rejectLot = (lotId: number, reason: string) => {
    setLots(prev => prev.map(l => l.id === lotId ? { ...l, status: 'unsold', rejectionReason: reason } : l));
  };

  const placeBid = (auctionId: number, userId: number, amount: number): boolean => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || auction.status !== 'active') return false;
    if (amount < auction.startPrice) return false;
    setBids(prev => [...prev, { id: Date.now(), auctionId, userId, amount, placedAt: Date.now() }]);
    return true;
  };

  const buyNow = (auctionId: number, userId: number) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || auction.type !== 'dutch' || auction.status !== 'active') return;
    const finalPrice = getDutchCurrentPrice(auction);
    setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: 'ended', winnerId: userId, finalPrice } : a));
    setLots(prev => prev.map(l => l.id === auction.lotId ? { ...l, status: 'sold' } : l));
  };

  const endAuction = (auctionId: number) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || auction.status !== 'active') return;

    if (auction.type === 'vickrey') {
      const sorted = bids.filter(b => b.auctionId === auctionId).sort((a, b) => b.amount - a.amount);
      if (sorted.length > 0) {
        const winnerId = sorted[0].userId;
        const finalPrice = sorted.length > 1 ? sorted[1].amount : sorted[0].amount;
        setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: 'ended', winnerId, finalPrice } : a));
        setLots(prev => prev.map(l => l.id === auction.lotId ? { ...l, status: 'sold' } : l));
      } else {
        setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: 'ended' } : a));
        setLots(prev => prev.map(l => l.id === auction.lotId ? { ...l, status: 'unsold' } : l));
      }
    } else {
      setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: 'ended' } : a));
      setLots(prev => prev.map(l => l.id === auction.lotId ? { ...l, status: 'unsold' } : l));
    }
  };

  const resetAll = () => {
    const NOW = Date.now();
    const MIN = 60_000;
    setRecords(INITIAL_RECORDS);
    setLots(INITIAL_LOTS);
    setBids(INITIAL_BIDS);
    setAuctions([
      { id: 1, lotId: 1, type: 'dutch', startPrice: 2000, reservePrice: 500, priceDecreasePerMinute: 20, startTime: NOW - 8 * MIN, endTime: NOW + 67 * MIN, status: 'active' },
      { id: 2, lotId: 2, type: 'dutch', startPrice: 3500, reservePrice: 1000, priceDecreasePerMinute: 35, startTime: NOW - 15 * MIN, endTime: NOW + 57 * MIN, status: 'active' },
      { id: 3, lotId: 3, type: 'vickrey', startPrice: 800, reservePrice: 400, startTime: NOW - 100 * MIN, endTime: NOW + 20 * MIN, status: 'active' },
      { id: 4, lotId: 4, type: 'vickrey', startPrice: 5000, reservePrice: 3000, startTime: NOW - 60 * MIN, endTime: NOW + 30 * MIN, status: 'active' },
      { id: 5, lotId: 5, type: 'vickrey', startPrice: 1500, reservePrice: 800, startTime: NOW - 30 * MIN, endTime: NOW + 30 * MIN, status: 'active' },
      { id: 6, lotId: 6, type: 'dutch', startPrice: 600, reservePrice: 200, priceDecreasePerMinute: 10, startTime: NOW - 90 * MIN, endTime: NOW - 60 * MIN, status: 'ended', winnerId: 4, finalPrice: 350 },
      { id: 7, lotId: 7, type: 'vickrey', startPrice: 700, reservePrice: 400, startTime: NOW - 300 * MIN, endTime: NOW - 240 * MIN, status: 'ended', winnerId: 5, finalPrice: 750 },
    ]);
  };

  const createLot = (input: CreateLotInput) => {
    const newRecord: VinylRecord = {
      id: Date.now(),
      artist: input.artist, title: input.title, year: input.year,
      label: input.label, condition: input.condition, conditionNote: input.conditionNote,
      format: input.format, genre: input.genre, description: input.description,
      labelColor: '#6b7280',
    };
    const newLot: Lot = {
      id: Date.now() + 1,
      recordId: newRecord.id, sellerId: input.sellerId,
      status: 'pending', auctionType: input.auctionType,
      startPrice: input.startPrice, reservePrice: input.reservePrice,
      priceDecreasePerMinute: input.priceDecreasePerMinute,
      durationMinutes: input.durationMinutes,
      createdAt: new Date().toISOString(),
    };
    setRecords(prev => [...prev, newRecord]);
    setLots(prev => [...prev, newLot]);
  };

  return (
    <AppContext.Provider value={{ lots, auctions, bids, records, approveLot, rejectLot, placeBid, buyNow, endAuction, createLot, getDutchCurrentPrice, resetAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
