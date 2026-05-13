import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { analytics } from '../analytics';
import type { GoldmineCondition, VinylFormat, AuctionType } from '../types';

const CONDITIONS: GoldmineCondition[] = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'];
const FORMATS: VinylFormat[] = ['12"', '7"', '10"'];
const GENRES = ['Rock', 'Jazz', 'Progressive Rock', 'Hard Rock', 'Grunge', 'Folk Rock', 'Alternative Rock', 'Glam Rock', 'Blues', 'Classical', 'Electronic', 'Punk', 'Soul', 'R&B', 'Country', 'Інше'];

export default function CreateLotPage() {
  const { user } = useAuth();
  const { createLot } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    artist: '', title: '', year: new Date().getFullYear(),
    label: '', condition: 'VG+' as GoldmineCondition, conditionNote: '',
    format: '12"' as VinylFormat, genre: 'Rock', description: '',
    auctionType: 'vickrey' as AuctionType,
    startPrice: '', reservePrice: '',
    priceDecreasePerMinute: '',
    durationMinutes: '60',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return <Navigate to="/" />;
  }

  const set = (key: keyof typeof form, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createLot({
      artist: form.artist, title: form.title,
      year: typeof form.year === 'string' ? parseInt(form.year) : form.year,
      label: form.label, condition: form.condition, conditionNote: form.conditionNote,
      format: form.format, genre: form.genre, description: form.description,
      auctionType: form.auctionType,
      startPrice: parseInt(form.startPrice),
      reservePrice: parseInt(form.reservePrice),
      priceDecreasePerMinute: form.auctionType === 'dutch' ? parseInt(form.priceDecreasePerMinute) : undefined,
      durationMinutes: parseInt(form.durationMinutes),
      sellerId: user.id,
    });
    analytics.createLot(form.auctionType);
    setSubmitted(true);
    setTimeout(() => navigate('/profile'), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center max-w-sm">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Лот подано на перевірку</h2>
          <p className="text-gray-500 text-sm">Адміністратор розгляне ваш лот і опублікує його найближчим часом.</p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Додати лот</h1>
        <p className="text-gray-500 text-sm mb-6">Після подачі лот перевіряє адміністратор і публікує аукціон</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Record info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-400">Інформація про платівку</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Виконавець *</label>
                <input required value={form.artist} onChange={e => set('artist', e.target.value)}
                  className={inputCls} placeholder="The Beatles" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Назва альбому *</label>
                <input required value={form.title} onChange={e => set('title', e.target.value)}
                  className={inputCls} placeholder="Abbey Road" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Рік *</label>
                <input required type="number" min={1900} max={2025} value={form.year}
                  onChange={e => set('year', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Формат</label>
                <select value={form.format} onChange={e => set('format', e.target.value as VinylFormat)} className={inputCls}>
                  {FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Жанр</label>
                <select value={form.genre} onChange={e => set('genre', e.target.value)} className={inputCls}>
                  {GENRES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Лейбл</label>
              <input value={form.label} onChange={e => set('label', e.target.value)}
                className={inputCls} placeholder="Capitol Records" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стан (Goldmine) *</label>
                <select required value={form.condition} onChange={e => set('condition', e.target.value as GoldmineCondition)} className={inputCls}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Примітка про стан</label>
                <input value={form.conditionNote} onChange={e => set('conditionNote', e.target.value)}
                  className={inputCls} placeholder="Деталі про стан..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                className={inputCls}
                placeholder="Деталі про пресинг, комплектність, особливості..."
              />
            </div>
          </div>

          {/* Auction settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-400">Параметри аукціону</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип аукціону</label>
              <div className="grid grid-cols-2 gap-2">
                {([['vickrey', 'Vickrey (запечатані ставки)', 'Учасники надсилають таємні ставки. Перемагає найвища, але переможець платить другу за величиною ціну.'],
                   ['dutch', 'Голландський (низхідний)', 'Ціна автоматично знижується. Перший хто натискає «Купити» отримує лот.']] as const).map(([val, label, desc]) => (
                  <button
                    key={val} type="button"
                    onClick={() => set('auctionType', val)}
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                      form.auctionType === val ? 'border-black bg-black text-white' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{label}</p>
                    <p className={`text-xs mt-1 ${form.auctionType === val ? 'text-gray-300' : 'text-gray-400'}`}>{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.auctionType === 'dutch' ? 'Початкова ціна (₴)' : 'Мінімальна ставка (₴)'} *
                </label>
                <input required type="number" min={1} value={form.startPrice}
                  onChange={e => set('startPrice', e.target.value)} className={inputCls} placeholder="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Резервна ціна (₴) *</label>
                <input required type="number" min={1} value={form.reservePrice}
                  onChange={e => set('reservePrice', e.target.value)} className={inputCls} placeholder="500" />
              </div>
            </div>

            {form.auctionType === 'dutch' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Зниження ціни (₴/хв) *</label>
                <input required type="number" min={1} value={form.priceDecreasePerMinute}
                  onChange={e => set('priceDecreasePerMinute', e.target.value)} className={inputCls} placeholder="10" />
                <p className="text-xs text-gray-400 mt-1">Ціна знижуватиметься на цю суму кожну хвилину</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тривалість (хвилини)</label>
              <select value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} className={inputCls}>
                {[30, 60, 90, 120, 180, 240, 360].map(d => (
                  <option key={d} value={d}>{d < 60 ? `${d} хвилин` : `${d / 60} год`}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Подати лот на перевірку
          </button>
        </form>
      </div>
    </div>
  );
}
