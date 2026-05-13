import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AdminPage() {
  const { user, users } = useAuth();
  const { lots, auctions, records, bids, approveLot, rejectLot, resetAll } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tab, setTab] = useState<'pending' | 'active' | 'ended'>('pending');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const pendingLots = lots.filter(l => l.status === 'pending');
  const activeLots = lots.filter(l => l.status === 'active');
  const endedAuctions = auctions.filter(a => a.status === 'ended');

  const getRecord = (lotId: number) => {
    const lot = lots.find(l => l.id === lotId);
    return records.find(r => lot && r.id === lot.recordId);
  };

  const getSeller = (lotId: number) => {
    const lot = lots.find(l => l.id === lotId);
    return users.find(u => lot && u.id === lot.sellerId);
  };

  const getAuction = (lotId: number) => auctions.find(a => a.lotId === lotId);

  const handleReject = (lotId: number) => {
    if (!rejectReason.trim()) return;
    rejectLot(lotId, rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  const stats = [
    { label: 'Очікують перевірки', value: pendingLots.length, color: 'text-yellow-600' },
    { label: 'Активних аукціонів', value: activeLots.length, color: 'text-green-600' },
    { label: 'Завершено', value: endedAuctions.length, color: 'text-gray-500' },
    { label: 'Всього ставок', value: bids.length, color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Панель адміністратора</h1>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Скинути до початкових даних
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
              <span className="text-sm text-yellow-800">Скинути всі аукціони?</span>
              <button
                onClick={() => { resetAll(); setShowResetConfirm(false); }}
                className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Так
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Скасувати
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {([['pending', `Очікують (${pendingLots.length})`], ['active', `Активні (${activeLots.length})`], ['ended', `Завершені`]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Pending lots */}
        {tab === 'pending' && (
          <div className="space-y-3">
            {pendingLots.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
                Немає лотів, що очікують перевірки
              </div>
            ) : pendingLots.map(lot => {
              const record = getRecord(lot.id);
              const seller = getSeller(lot.id);
              if (!record) return null;
              return (
                <div key={lot.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lot.auctionType === 'dutch' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                        }`}>
                          {lot.auctionType === 'dutch' ? 'Голландський' : 'Vickrey'}
                        </span>
                        <span className="text-xs text-gray-400">{record.format} · {record.condition}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{record.artist} — {record.title}</h3>
                      <p className="text-sm text-gray-500">{record.year} · {record.label} · {record.genre}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Старт: <strong>{lot.startPrice.toLocaleString()} ₴</strong></span>
                        <span>Резерв: <strong>{lot.reservePrice.toLocaleString()} ₴</strong></span>
                        <span>Тривалість: <strong>{lot.durationMinutes} хв</strong></span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Продавець: {seller?.name} · {new Date(lot.createdAt).toLocaleString('uk-UA')}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => approveLot(lot.id)}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Схвалити
                      </button>
                      <button
                        onClick={() => setRejectId(lot.id)}
                        className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Відхилити
                      </button>
                    </div>
                  </div>

                  {rejectId === lot.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Причина відхилення..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(lot.id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
                        >
                          Підтвердити відхилення
                        </button>
                        <button
                          onClick={() => { setRejectId(null); setRejectReason(''); }}
                          className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Active auctions */}
        {tab === 'active' && (
          <div className="space-y-3">
            {activeLots.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">Немає активних аукціонів</div>
            ) : activeLots.map(lot => {
              const record = getRecord(lot.id);
              const auction = getAuction(lot.id);
              const seller = getSeller(lot.id);
              if (!record || !auction) return null;
              const bidCount = bids.filter(b => b.auctionId === auction.id).length;
              const remaining = Math.max(0, auction.endTime - Date.now());
              const h = Math.floor(remaining / 3_600_000);
              const m = Math.floor((remaining % 3_600_000) / 60_000);
              return (
                <div key={lot.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        auction.type === 'dutch' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                      }`}>
                        {auction.type === 'dutch' ? 'Голландський' : 'Vickrey'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{record.artist} — {record.title}</h3>
                    <p className="text-sm text-gray-500">Продавець: {seller?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{bidCount} ставок</p>
                    <p className="text-xs text-gray-500">
                      {remaining === 0 ? 'Завершено' : `${h > 0 ? h + 'г ' : ''}${m}хв`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ended auctions */}
        {tab === 'ended' && (
          <div className="space-y-3">
            {endedAuctions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">Немає завершених аукціонів</div>
            ) : endedAuctions.map(auction => {
              const lot = lots.find(l => l.id === auction.lotId);
              const record = lot ? records.find(r => r.id === lot.recordId) : undefined;
              const winner = auction.winnerId ? users.find(u => u.id === auction.winnerId) : undefined;
              if (!record) return null;
              return (
                <div key={auction.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.artist} — {record.title}</h3>
                    <p className="text-sm text-gray-500">{auction.type === 'dutch' ? 'Голландський' : 'Vickrey'}</p>
                  </div>
                  <div className="text-right">
                    {auction.winnerId ? (
                      <>
                        <p className="text-sm font-bold text-green-600">{auction.finalPrice?.toLocaleString()} ₴</p>
                        <p className="text-xs text-gray-500">Переможець: {winner?.name}</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Не продано</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
