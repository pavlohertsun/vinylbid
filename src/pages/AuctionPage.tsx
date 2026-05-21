import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import VinylDisc from '../components/VinylDisc';
import { analytics } from '../analytics';
import { mp } from '../mixpanel';
import Timer from '../components/Timer';

const conditionColor: Record<string, string> = {
  M: 'text-green-600', NM: 'text-green-500', 'VG+': 'text-lime-600',
  VG: 'text-yellow-600', 'G+': 'text-orange-500', G: 'text-red-500',
};

const conditionDesc: Record<string, string> = {
  M: 'Mint — ідеальний стан', NM: 'Near Mint — майже ідеальний',
  'VG+': 'Very Good Plus — дуже добрий', VG: 'Very Good — добрий',
  'G+': 'Good Plus — задовільний', G: 'Good — посередній', F: 'Fair', P: 'Poor',
};

export default function AuctionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auctions, lots, records, bids, getDutchCurrentPrice, buyNow, placeBid, endAuction } = useApp();
  const { user, users } = useAuth();

  const auction = auctions.find(a => a.id === Number(id));
  const lot = auction ? lots.find(l => l.id === auction.lotId) : undefined;
  const record = lot ? records.find(r => r.id === lot.recordId) : undefined;

  const [currentPrice, setCurrentPrice] = useState(auction ? getDutchCurrentPrice(auction) : 0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!auction || !record || viewTracked.current) return;
    viewTracked.current = true;
    analytics.viewAuction(auction.id, auction.type, record.artist, record.title, auction.startPrice);
    mp.viewAuction(auction.id, auction.type, record.artist, record.title);
  }, [auction, record]);

  useEffect(() => {
    if (!auction || auction.type !== 'dutch' || auction.status !== 'active') return;
    const id = setInterval(() => {
      const price = getDutchCurrentPrice(auction);
      setCurrentPrice(price);
      if (price <= auction.reservePrice) {
        endAuction(auction.id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [auction, getDutchCurrentPrice, endAuction]);

  if (!auction || !lot || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Аукціон не знайдено. <Link to="/catalog" className="ml-2 text-black underline">До каталогу</Link>
      </div>
    );
  }

  const auctionBids = bids.filter(b => b.auctionId === auction.id).sort((a, b) => b.amount - a.amount);
  const seller = users.find(u => u.id === lot.sellerId);
  const winner = auction.winnerId ? users.find(u => u.id === auction.winnerId) : undefined;
  const userAlreadyBid = auctionBids.some(b => b.userId === user?.id);
  const isOwner = user?.id === lot.sellerId;

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    buyNow(auction.id, user.id);
    analytics.buyNow(auction.id, currentPrice, record.artist, record.title);
    mp.buyNow(auction.id, currentPrice, record.artist, record.title);
    navigate(`/payment/${auction.id}`);
  };

  const handlePlaceBid = (e: FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount < auction.startPrice) {
      setBidError(`Мінімальна ставка: ${auction.startPrice} ₴`);
      return;
    }
    const ok = placeBid(auction.id, user.id, amount);
    if (ok) {
      analytics.placeBid(auction.id, amount, record.artist, record.title);
      mp.placeBid(auction.id, amount, record.artist, record.title);
      setBidSuccess(true);
      setBidError('');
      setBidAmount('');
      setTimeout(() => setBidSuccess(false), 3000);
    }
  };

  const handleAuctionEnd = () => {
    if (auction.status === 'active') endAuction(auction.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/catalog" className="hover:text-black">Каталог</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{record.artist} — {record.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Vinyl visual */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex justify-center items-center">
              <VinylDisc
                labelColor={record.labelColor}
                size={240}
                spinning={auction.status === 'active' && auction.type === 'dutch'}
              />
            </div>

            {/* Record details */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Деталі запису</h3>
              {[
                ['Виконавець', record.artist],
                ['Назва', record.title],
                ['Рік', String(record.year)],
                ['Лейбл', record.label],
                ['Формат', record.format],
                ['Жанр', record.genre],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Стан</span>
                <span className={`font-medium ${conditionColor[record.condition] ?? 'text-gray-700'}`}>
                  {record.condition} — {conditionDesc[record.condition]}
                </span>
              </div>
              {record.conditionNote && (
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">{record.conditionNote}</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Опис</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{record.description}</p>
            </div>
          </div>

          {/* Right — Auction panel */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm">{record.artist}</p>
                  <h1 className="text-xl font-bold text-gray-900">{record.title}</h1>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  auction.type === 'dutch' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                }`}>
                  {auction.type === 'dutch' ? 'Голландський' : 'Vickrey'}
                </span>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-2 mb-5 ${
                auction.status === 'active' ? 'text-green-600' : 'text-gray-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  auction.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium">
                  {auction.status === 'active' ? 'Аукціон активний' : 'Аукціон завершено'}
                </span>
              </div>

              {/* Dutch auction panel */}
              {auction.type === 'dutch' && (
                <div>
                  {auction.status === 'active' ? (
                    <>
                      <div className="mb-5">
                        <p className="text-sm text-gray-500 mb-1">Поточна ціна</p>
                        <p className="text-4xl font-bold text-gray-900">{currentPrice.toLocaleString()} ₴</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Знижується на {lot.priceDecreasePerMinute} ₴/хв · резервна ціна: {auction.reservePrice.toLocaleString()} ₴
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-500">До завершення:</span>
                        <Timer endTime={auction.endTime} onEnd={handleAuctionEnd} className="font-bold text-gray-900" />
                      </div>
                      {!isOwner && (
                        <button
                          onClick={handleBuyNow}
                          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                          Купити зараз за {currentPrice.toLocaleString()} ₴
                        </button>
                      )}
                      {isOwner && (
                        <p className="text-sm text-gray-400 text-center">Це ваш лот</p>
                      )}
                      {!user && (
                        <p className="text-center text-sm text-gray-500 mt-3">
                          <Link to="/login" className="text-black font-medium">Увійдіть</Link>, щоб купити
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      {auction.winnerId ? (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Продано!</p>
                          <p className="text-2xl font-bold text-green-900 mt-1">{auction.finalPrice?.toLocaleString()} ₴</p>
                          <p className="text-sm text-green-700 mt-1">Переможець: {winner?.name ?? '—'}</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                          <p className="text-sm text-gray-500">Аукціон завершився без переможця</p>
                        </div>
                      )}
                      {auction.winnerId === user?.id && (
                        <Link
                          to={`/payment/${auction.id}`}
                          className="block w-full text-center bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                          Перейти до оплати
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Vickrey auction panel */}
              {auction.type === 'vickrey' && (
                <div>
                  <div className="mb-5">
                    <p className="text-sm text-gray-500 mb-1">Мінімальна ставка</p>
                    <p className="text-4xl font-bold text-gray-900">{auction.startPrice.toLocaleString()} ₴</p>
                    {auction.status === 'active' && (
                      <p className="text-xs text-gray-400 mt-1">
                        {auctionBids.length} {auctionBids.length === 1 ? 'ставка' : 'ставок'} · ставки запечатані
                      </p>
                    )}
                  </div>

                  {auction.status === 'active' && (
                    <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">До закриття торгів:</span>
                      <Timer endTime={auction.endTime} onEnd={handleAuctionEnd} className="font-bold text-gray-900" />
                    </div>
                  )}

                  {auction.status === 'active' && !isOwner && (
                    <div>
                      {userAlreadyBid ? (
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 mb-4">
                          Вашу ставку прийнято. Результати будуть відомі після закриття торгів.
                        </div>
                      ) : null}
                      {!user ? (
                        <p className="text-center text-sm text-gray-500">
                          <Link to="/login" className="text-black font-medium">Увійдіть</Link>, щоб зробити ставку
                        </p>
                      ) : (
                        <form onSubmit={handlePlaceBid} className="flex gap-2">
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            placeholder={`від ${auction.startPrice} ₴`}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                          />
                          <button
                            type="submit"
                            className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                          >
                            Зробити ставку
                          </button>
                        </form>
                      )}
                      {bidError && <p className="text-red-500 text-xs mt-2">{bidError}</p>}
                      {bidSuccess && <p className="text-green-600 text-xs mt-2">Ставку прийнято!</p>}
                      <p className="text-xs text-gray-400 mt-3">
                        Переможець платить ціну другої найвищої ставки (аукціон Vickrey)
                      </p>
                    </div>
                  )}

                  {auction.status === 'ended' && (
                    <div className="space-y-3">
                      {auction.winnerId ? (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Переможець визначено</p>
                          <p className="text-2xl font-bold text-green-900 mt-1">{auction.finalPrice?.toLocaleString()} ₴</p>
                          <p className="text-sm text-green-700 mt-1">Ціна другої найвищої ставки</p>
                          <p className="text-sm text-green-700">Переможець: {winner?.name ?? '—'}</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Аукціон завершився без ставок</p>
                        </div>
                      )}
                      {auction.winnerId === user?.id && (
                        <Link
                          to={`/payment/${auction.id}`}
                          className="block w-full text-center bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                          Перейти до оплати
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seller info */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Продавець</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{seller?.name}</p>
                  <p className="text-xs text-gray-500">на платформі з {seller?.joinedAt}</p>
                </div>
                {seller && seller.ratingCount > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">★ {seller.rating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">{seller.ratingCount} відгуків</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bid history for ended Vickrey auctions */}
            {auction.type === 'vickrey' && auction.status === 'ended' && auctionBids.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Результати ставок</h3>
                <div className="space-y-2">
                  {auctionBids.map((bid, i) => {
                    const bidder = users.find(u => u.id === bid.userId);
                    return (
                      <div key={bid.id} className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                        i === 0 ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-green-600">👑</span>}
                          <span className="text-gray-700">{bidder?.name}</span>
                        </div>
                        <span className={`font-bold ${i === 0 ? 'text-green-700' : 'text-gray-600'}`}>
                          {bid.amount.toLocaleString()} ₴
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
