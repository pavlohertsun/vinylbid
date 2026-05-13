import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Auction, VinylRecord } from '../types';
import VinylDisc from './VinylDisc';
import { useApp } from '../context/AppContext';

const conditionColor: Record<string, string> = {
  M: 'text-green-600', NM: 'text-green-500', 'VG+': 'text-lime-600',
  VG: 'text-yellow-600', 'G+': 'text-orange-500', G: 'text-red-500', F: 'text-red-600', P: 'text-red-700',
};

interface AuctionCardProps {
  auction: Auction;
  record: VinylRecord;
}

export default function AuctionCard({ auction, record }: AuctionCardProps) {
  const { bids, getDutchCurrentPrice } = useApp();
  const [currentPrice, setCurrentPrice] = useState(getDutchCurrentPrice(auction));

  useEffect(() => {
    if (auction.type !== 'dutch' || auction.status !== 'active') return;
    const id = setInterval(() => setCurrentPrice(getDutchCurrentPrice(auction)), 5000);
    return () => clearInterval(id);
  }, [auction, getDutchCurrentPrice]);

  const auctionBids = bids.filter(b => b.auctionId === auction.id);
  const displayPrice = auction.type === 'dutch' ? currentPrice : auction.startPrice;
  const priceLabel = auction.type === 'dutch' ? 'Поточна ціна' : 'Мін. ставка';
  const timeRemaining = Math.max(0, auction.endTime - Date.now());
  const h = Math.floor(timeRemaining / 3_600_000);
  const m = Math.floor((timeRemaining % 3_600_000) / 60_000);

  return (
    <Link to={`/auction/${auction.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-md transition-all duration-200">
        <div className="bg-gray-50 p-6 flex justify-center items-center">
          <VinylDisc labelColor={record.labelColor} size={120} />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{record.artist}</p>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-black">
                {record.title}
              </h3>
            </div>
            <span className={`text-xs font-medium shrink-0 ${conditionColor[record.condition] ?? 'text-gray-500'}`}>
              {record.condition}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              auction.type === 'dutch'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-violet-50 text-violet-700'
            }`}>
              {auction.type === 'dutch' ? 'Голландський' : 'Vickrey'}
            </span>
            <span className="text-xs text-gray-400">{record.year} · {record.format}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500">{priceLabel}</p>
              <p className="text-lg font-bold text-gray-900">{displayPrice.toLocaleString()} ₴</p>
            </div>
            <div className="text-right">
              {auction.status === 'active' ? (
                <>
                  <p className="text-xs text-gray-500">
                    {auction.type === 'vickrey' ? `${auctionBids.length} ставок` : 'залишилось'}
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {timeRemaining === 0 ? 'Завершено' : `${h > 0 ? h + 'г ' : ''}${m}хв`}
                  </p>
                </>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                  {auction.winnerId ? 'Продано' : 'Не продано'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
