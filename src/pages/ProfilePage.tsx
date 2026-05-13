import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  active: 'bg-green-50 text-green-700',
  sold: 'bg-gray-100 text-gray-600',
  unsold: 'bg-red-50 text-red-600',
  draft: 'bg-gray-100 text-gray-500',
};

const statusLabel: Record<string, string> = {
  pending: 'На перевірці', active: 'Активний', sold: 'Продано', unsold: 'Не продано', draft: 'Чернетка',
};

export default function ProfilePage() {
  const { user, users } = useAuth();
  const { lots, auctions, records, bids } = useApp();

  if (!user) return <Navigate to="/login" />;

  const myLots = lots.filter(l => l.sellerId === user.id).map(l => ({
    lot: l,
    record: records.find(r => r.id === l.recordId),
    auction: auctions.find(a => a.lotId === l.id),
  }));

  const myBids = bids.filter(b => b.userId === user.id).map(b => {
    const auction = auctions.find(a => a.id === b.auctionId);
    const lot = auction ? lots.find(l => l.id === auction.lotId) : undefined;
    const record = lot ? records.find(r => r.id === lot.recordId) : undefined;
    return { bid: b, auction, record };
  });

  const wonAuctions = auctions.filter(a => a.winnerId === user.id && a.status === 'ended');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold mb-3">
                {user.name[0].toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                  {user.role === 'admin' ? 'Адміністратор' : user.role === 'seller' ? 'Продавець' : 'Покупець'}
                </span>
                {user.ratingCount > 0 && (
                  <span className="text-xs text-gray-500">★ {user.rating.toFixed(1)} ({user.ratingCount} відгуків)</span>
                )}
                <span className="text-xs text-gray-400">на платформі з {user.joinedAt}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              {user.role !== 'admin' && (
                <>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{myLots.length}</p>
                    <p className="text-xs text-gray-500">Лотів</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{wonAuctions.length}</p>
                    <p className="text-xs text-gray-500">Виграно</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* My lots (for sellers) */}
        {(user.role === 'seller' || user.role === 'admin') && myLots.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Мої лоти</h2>
              <Link to="/create-lot" className="text-sm text-gray-500 hover:text-black">+ Додати лот</Link>
            </div>
            <div className="space-y-3">
              {myLots.map(({ lot, record, auction }) => {
                if (!record) return null;
                return (
                  <div key={lot.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{record.artist}</p>
                      <p className="font-medium text-gray-900 truncate">{record.title}</p>
                      <p className="text-xs text-gray-400">{record.year} · {record.condition} · {lot.auctionType === 'dutch' ? 'Голландський' : 'Vickrey'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{lot.startPrice.toLocaleString()} ₴</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[lot.status]}`}>
                        {statusLabel[lot.status]}
                      </span>
                      {auction && lot.status === 'active' && (
                        <Link to={`/auction/${auction.id}`} className="text-xs text-gray-500 hover:text-black underline">
                          Переглянути
                        </Link>
                      )}
                      {lot.rejectionReason && (
                        <span className="text-xs text-red-500" title={lot.rejectionReason}>Причина: {lot.rejectionReason}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Won auctions */}
        {wonAuctions.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Виграні аукціони</h2>
            <div className="space-y-3">
              {wonAuctions.map(auction => {
                const lot = lots.find(l => l.id === auction.lotId);
                const record = lot ? records.find(r => r.id === lot.recordId) : undefined;
                const seller = lot ? users.find(u => u.id === lot.sellerId) : undefined;
                if (!record) return null;
                return (
                  <div key={auction.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">{record.artist}</p>
                      <p className="font-medium text-gray-900">{record.title}</p>
                      <p className="text-xs text-gray-400">Продавець: {seller?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{auction.finalPrice?.toLocaleString()} ₴</p>
                      <Link to={`/payment/${auction.id}`} className="text-xs text-black underline hover:no-underline">
                        Оплатити
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My bids */}
        {myBids.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Мої ставки</h2>
            <div className="space-y-2">
              {myBids.map(({ bid, auction, record }) => {
                if (!record || !auction) return null;
                const isWinner = auction.winnerId === user.id && auction.status === 'ended';
                return (
                  <div key={bid.id} className={`bg-white border rounded-xl p-4 flex items-center justify-between gap-4 ${
                    isWinner ? 'border-green-200' : 'border-gray-200'
                  }`}>
                    <div>
                      <p className="text-xs text-gray-500">{record.artist}</p>
                      <p className="font-medium text-gray-900">{record.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(bid.placedAt).toLocaleString('uk-UA')}
                        {auction.status === 'active' && ' · Аукціон активний'}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{bid.amount.toLocaleString()} ₴</p>
                        {auction.status === 'active' && (
                          <p className="text-xs text-gray-400">Запечатана ставка</p>
                        )}
                      </div>
                      {isWinner && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Переможець</span>
                      )}
                      {auction.status === 'active' && (
                        <Link to={`/auction/${auction.id}`} className="text-xs text-gray-500 hover:text-black underline">
                          Аукціон
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {myLots.length === 0 && myBids.length === 0 && wonAuctions.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
            <p className="text-lg mb-4">Тут поки порожньо</p>
            <Link to="/catalog" className="text-black font-medium hover:underline">Переглянути каталог →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
