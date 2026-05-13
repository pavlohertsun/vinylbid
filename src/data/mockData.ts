import type { User, VinylRecord, Lot, Auction, Bid } from '../types';

const NOW = Date.now();
const MIN = 60_000;

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Admin', email: 'admin@vinylbid.com', password: 'admin123', role: 'admin', rating: 5, ratingCount: 0, joinedAt: '2025-01-01' },
  { id: 2, name: 'John Vinyl', email: 'john@mail.com', password: 'pass123', role: 'seller', rating: 4.8, ratingCount: 23, joinedAt: '2025-03-10' },
  { id: 3, name: 'Maria Records', email: 'maria@mail.com', password: 'pass123', role: 'seller', rating: 4.5, ratingCount: 12, joinedAt: '2025-05-20' },
  { id: 4, name: 'Alex Collector', email: 'alex@mail.com', password: 'pass123', role: 'buyer', rating: 4.9, ratingCount: 8, joinedAt: '2025-07-01' },
  { id: 5, name: 'Kate Music', email: 'kate@mail.com', password: 'pass123', role: 'buyer', rating: 4.7, ratingCount: 5, joinedAt: '2025-09-15' },
];

export const INITIAL_RECORDS: VinylRecord[] = [
  { id: 1, artist: 'Pink Floyd', title: 'The Dark Side of the Moon', year: 1973, label: 'Harvest Records', condition: 'VG+', conditionNote: 'Light surface marks, plays perfectly', format: '12"', genre: 'Progressive Rock', description: 'Original UK pressing. One of the best-sounding copies you will find. Cover in excellent shape with only minimal wear to the corners.', labelColor: '#e11d48' },
  { id: 2, artist: 'The Beatles', title: 'Abbey Road', year: 1969, label: 'Apple Records', condition: 'NM', conditionNote: 'Near mint — played once', format: '12"', genre: 'Rock', description: 'UK first pressing with the misaligned "Her Majesty" track. Exceptional copy stored properly for decades. Original inner sleeve included.', labelColor: '#16a34a' },
  { id: 3, artist: 'Miles Davis', title: 'Kind of Blue', year: 1959, label: 'Columbia Records', condition: 'VG', conditionNote: 'Some light scratches audible on quiet passages', format: '12"', genre: 'Jazz', description: 'Original 6-eye pressing. One of the greatest jazz albums ever recorded. Some light marks visible under bright light. Still sounds fantastic.', labelColor: '#d97706' },
  { id: 4, artist: 'Led Zeppelin', title: 'Led Zeppelin IV', year: 1971, label: 'Atlantic Records', condition: 'M', conditionNote: 'Mint — unplayed', format: '12"', genre: 'Hard Rock', description: 'UK original pressing, never played. Still has original shrink wrap removed only for photos. Graded M by three independent Goldmine-certified experts.', labelColor: '#7c3aed' },
  { id: 5, artist: 'David Bowie', title: 'The Rise and Fall of Ziggy Stardust', year: 1972, label: 'RCA Records', condition: 'G+', conditionNote: 'Heavy play wear but no skips', format: '12"', genre: 'Glam Rock', description: 'UK original pressing. A well-loved copy with real character. Cover shows significant wear consistent with age. Priced accordingly.', labelColor: '#0ea5e9' },
  { id: 6, artist: 'Nirvana', title: 'Nevermind', year: 1991, label: 'DGC Records', condition: 'VG+', conditionNote: 'Very clean, no issues', format: '12"', genre: 'Grunge', description: 'Original US DGC pressing in black label. Very clean copy showing only minor signs of play. All inserts present.', labelColor: '#65a30d' },
  { id: 7, artist: 'King Crimson', title: 'In the Court of the Crimson King', year: 1969, label: 'Island Records', condition: 'VG+', conditionNote: 'Very clean, plays excellent', format: '12"', genre: 'Progressive Rock', description: 'UK original pink Island label. Stunning copy. Considered the blueprint for progressive rock. Rarely found in this condition.', labelColor: '#dc2626' },
  { id: 8, artist: 'Bob Dylan', title: 'Blood on the Tracks', year: 1975, label: 'Columbia Records', condition: 'NM', conditionNote: 'Near mint throughout', format: '12"', genre: 'Folk Rock', description: 'Original pressing. Exceptional audio quality. Considered by many to be Dylan\'s masterpiece. All labels clean and bright.', labelColor: '#0891b2' },
  { id: 9, artist: 'Radiohead', title: 'OK Computer', year: 1997, label: 'Parlophone', condition: 'NM', conditionNote: 'Near perfect', format: '12"', genre: 'Alternative Rock', description: 'UK original Parlophone pressing. One of the defining albums of the 1990s. Comes with original booklet and all inserts.', labelColor: '#9333ea' },
];

export const INITIAL_LOTS: Lot[] = [
  { id: 1, recordId: 1, sellerId: 2, status: 'active', auctionType: 'dutch', startPrice: 2000, reservePrice: 500, priceDecreasePerMinute: 20, durationMinutes: 75, createdAt: new Date(NOW - 8 * MIN).toISOString() },
  { id: 2, recordId: 2, sellerId: 2, status: 'active', auctionType: 'dutch', startPrice: 3500, reservePrice: 1000, priceDecreasePerMinute: 35, durationMinutes: 72, createdAt: new Date(NOW - 15 * MIN).toISOString() },
  { id: 3, recordId: 3, sellerId: 3, status: 'active', auctionType: 'vickrey', startPrice: 800, reservePrice: 400, durationMinutes: 120, createdAt: new Date(NOW - 100 * MIN).toISOString() },
  { id: 4, recordId: 4, sellerId: 3, status: 'active', auctionType: 'vickrey', startPrice: 5000, reservePrice: 3000, durationMinutes: 90, createdAt: new Date(NOW - 60 * MIN).toISOString() },
  { id: 5, recordId: 9, sellerId: 2, status: 'active', auctionType: 'vickrey', startPrice: 1500, reservePrice: 800, durationMinutes: 60, createdAt: new Date(NOW - 30 * MIN).toISOString() },
  { id: 6, recordId: 5, sellerId: 2, status: 'sold', auctionType: 'dutch', startPrice: 600, reservePrice: 200, priceDecreasePerMinute: 10, durationMinutes: 40, createdAt: new Date(NOW - 120 * MIN).toISOString() },
  { id: 7, recordId: 6, sellerId: 3, status: 'sold', auctionType: 'vickrey', startPrice: 700, reservePrice: 400, durationMinutes: 60, createdAt: new Date(NOW - 300 * MIN).toISOString() },
  { id: 8, recordId: 7, sellerId: 2, status: 'pending', auctionType: 'vickrey', startPrice: 4000, reservePrice: 2500, durationMinutes: 120, createdAt: new Date(NOW - 2 * MIN).toISOString() },
  { id: 9, recordId: 8, sellerId: 3, status: 'pending', auctionType: 'dutch', startPrice: 1200, reservePrice: 600, priceDecreasePerMinute: 15, durationMinutes: 40, createdAt: new Date(NOW - 5 * MIN).toISOString() },
];

export const INITIAL_AUCTIONS: Auction[] = [
  // Dutch active
  { id: 1, lotId: 1, type: 'dutch', startPrice: 2000, reservePrice: 500, priceDecreasePerMinute: 20, startTime: NOW - 8 * MIN, endTime: NOW + 67 * MIN, status: 'active' },
  { id: 2, lotId: 2, type: 'dutch', startPrice: 3500, reservePrice: 1000, priceDecreasePerMinute: 35, startTime: NOW - 15 * MIN, endTime: NOW + 57 * MIN, status: 'active' },
  // Vickrey active
  { id: 3, lotId: 3, type: 'vickrey', startPrice: 800, reservePrice: 400, startTime: NOW - 100 * MIN, endTime: NOW + 20 * MIN, status: 'active' },
  { id: 4, lotId: 4, type: 'vickrey', startPrice: 5000, reservePrice: 3000, startTime: NOW - 60 * MIN, endTime: NOW + 30 * MIN, status: 'active' },
  { id: 5, lotId: 5, type: 'vickrey', startPrice: 1500, reservePrice: 800, startTime: NOW - 30 * MIN, endTime: NOW + 30 * MIN, status: 'active' },
  // Ended
  { id: 6, lotId: 6, type: 'dutch', startPrice: 600, reservePrice: 200, priceDecreasePerMinute: 10, startTime: NOW - 90 * MIN, endTime: NOW - 60 * MIN, status: 'ended', winnerId: 4, finalPrice: 350 },
  { id: 7, lotId: 7, type: 'vickrey', startPrice: 700, reservePrice: 400, startTime: NOW - 300 * MIN, endTime: NOW - 240 * MIN, status: 'ended', winnerId: 5, finalPrice: 750 },
];

export const INITIAL_BIDS: Bid[] = [
  // Auction 3 (Vickrey — Miles Davis, ends soon)
  { id: 1, auctionId: 3, userId: 4, amount: 950, placedAt: NOW - 80 * MIN },
  { id: 2, auctionId: 3, userId: 5, amount: 1100, placedAt: NOW - 60 * MIN },
  { id: 3, auctionId: 3, userId: 4, amount: 1250, placedAt: NOW - 30 * MIN },
  // Auction 4 (Vickrey — Led Zeppelin IV)
  { id: 4, auctionId: 4, userId: 4, amount: 5200, placedAt: NOW - 50 * MIN },
  { id: 5, auctionId: 4, userId: 5, amount: 5800, placedAt: NOW - 40 * MIN },
  { id: 6, auctionId: 4, userId: 4, amount: 6100, placedAt: NOW - 25 * MIN },
  { id: 7, auctionId: 4, userId: 5, amount: 6500, placedAt: NOW - 15 * MIN },
  { id: 8, auctionId: 4, userId: 4, amount: 7000, placedAt: NOW - 5 * MIN },
  // Auction 5 (Vickrey — Radiohead)
  { id: 9, auctionId: 5, userId: 4, amount: 1600, placedAt: NOW - 25 * MIN },
  { id: 10, auctionId: 5, userId: 5, amount: 1900, placedAt: NOW - 10 * MIN },
  // Ended auctions (revealed)
  { id: 11, auctionId: 6, userId: 4, amount: 350, placedAt: NOW - 75 * MIN },
  { id: 12, auctionId: 7, userId: 4, amount: 750, placedAt: NOW - 280 * MIN },
  { id: 13, auctionId: 7, userId: 5, amount: 900, placedAt: NOW - 260 * MIN },
];
