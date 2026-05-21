import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analytics } from '../analytics';
import { mp } from '../mixpanel';
import { amp } from '../amplitude';
import AuctionCard from '../components/AuctionCard';
import type { AuctionType, AuctionStatus } from '../types';

const GENRES = ['Всі', 'Rock', 'Jazz', 'Progressive Rock', 'Hard Rock', 'Grunge', 'Folk Rock', 'Alternative Rock', 'Glam Rock'];

export default function CatalogPage() {
  const { auctions, lots, records } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AuctionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | 'all'>('active');
  const [genre, setGenre] = useState('Всі');

  const enriched = auctions.map(a => {
    const lot = lots.find(l => l.id === a.lotId);
    const record = records.find(r => lot && r.id === lot.recordId);
    return { auction: a, record };
  }).filter((x): x is { auction: typeof x.auction; record: NonNullable<typeof x.record> } => !!x.record);

  const filtered = enriched.filter(({ auction, record }) => {
    if (typeFilter !== 'all' && auction.type !== typeFilter) return false;
    if (statusFilter !== 'all' && auction.status !== statusFilter) return false;
    if (genre !== 'Всі' && record.genre !== genre) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!record.artist.toLowerCase().includes(q) && !record.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Каталог аукціонів</h1>
          <p className="text-gray-500 text-sm">{filtered.length} лотів</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text" placeholder="Пошук за виконавцем або назвою..."
            value={search} onChange={e => { setSearch(e.target.value); if (e.target.value.length > 2) { analytics.search(e.target.value); mp.search(e.target.value, filtered.length); amp.search(e.target.value, filtered.length); } }}
            className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />

          <div className="flex gap-1">
            {([['all', 'Всі'], ['dutch', 'Голландський'], ['vickrey', 'Vickrey']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setTypeFilter(val as typeof typeFilter); analytics.filterCatalog('auction_type', val); mp.filterCatalog('auction_type', val); amp.filterCatalog('auction_type', val); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === val ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {([['active', 'Активні'], ['ended', 'Завершені'], ['all', 'Всі']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === val ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={genre} onChange={e => { setGenre(e.target.value); analytics.filterCatalog('genre', e.target.value); mp.filterCatalog('genre', e.target.value); amp.filterCatalog('genre', e.target.value); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
          >
            {GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-1">Нічого не знайдено</p>
            <p className="text-sm">Спробуйте змінити фільтри</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(({ auction, record }) => (
              <AuctionCard key={auction.id} auction={auction} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
