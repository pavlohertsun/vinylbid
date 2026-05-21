import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { analytics } from '../analytics';
import { mp } from '../mixpanel';

function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let sum = 0; let even = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (even) { d *= 2; if (d > 9) d -= 9; }
    sum += d; even = !even;
  }
  return sum % 10 === 0;
}

function formatCard(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function validateExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const [, mm, yy] = match;
  const month = parseInt(mm, 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const cardYear = 2000 + parseInt(yy, 10);
  const cardMonth = month;
  return cardYear > now.getFullYear() || (cardYear === now.getFullYear() && cardMonth >= now.getMonth() + 1);
}

export default function PaymentPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const { user } = useAuth();
  const { auctions, lots, records } = useApp();
  const navigate = useNavigate();

  const auction = auctions.find(a => a.id === Number(auctionId));
  const lot = auction ? lots.find(l => l.id === auction.lotId) : undefined;
  const record = lot ? records.find(r => r.id === lot.recordId) : undefined;

  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (!auction || !record || checkoutTracked.current) return;
    checkoutTracked.current = true;
    analytics.beginCheckout(auction.id, auction.finalPrice ?? 0);
    mp.beginCheckout(auction.id, auction.finalPrice ?? 0);
  }, [auction, record]);

  if (!user) return <Navigate to="/login" />;
  if (!auction || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Аукціон не знайдено. <Link to="/profile" className="ml-2 text-black underline">До профілю</Link>
      </div>
    );
  }

  const handleExpiryInput = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    setExpiry(v);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const rawCard = card.replace(/\s/g, '');
    if (rawCard.length !== 16) errs.card = 'Номер картки має містити 16 цифр';
    else if (!luhn(rawCard)) errs.card = 'Невалідний номер картки';
    if (!validateExpiry(expiry)) errs.expiry = 'Невалідна дата або картка прострочена';
    if (cvv.length < 3) errs.cvv = 'CVV має містити 3–4 цифри';
    if (!name.trim()) errs.name = "Вкажіть ім'я власника картки";
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    analytics.purchase(auction.id, auction.finalPrice ?? 0, record.artist, record.title);
    mp.purchase(auction.id, auction.finalPrice ?? 0, record.artist, record.title);
    setSuccess(true);
    setTimeout(() => navigate('/profile'), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Оплату прийнято!</h2>
          <p className="text-gray-500 text-sm mb-1">
            {record.artist} — {record.title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            {auction.finalPrice?.toLocaleString()} ₴
          </p>
          <p className="text-gray-400 text-sm">Перенаправлення до профілю...</p>
        </div>
      </div>
    );
  }

  const inputCls = (err?: string) => `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${
    err ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
  }`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Link to={`/auction/${auction.id}`} className="text-sm text-gray-500 hover:text-black mb-6 block">
          ← Назад до аукціону
        </Link>

        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Підсумок замовлення</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">{record.artist}</span>
            <span className="text-gray-900">{record.title}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Тип аукціону</span>
            <span className="text-gray-900">{auction.type === 'dutch' ? 'Голландський' : 'Vickrey'}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-100 pt-3 mt-3">
            <span>До сплати</span>
            <span className="text-xl">{auction.finalPrice?.toLocaleString()} ₴</span>
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Дані картки</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер картки</label>
              <input
                type="text" value={card} inputMode="numeric"
                onChange={e => setCard(formatCard(e.target.value))}
                className={inputCls(errors.card)}
                placeholder="0000 0000 0000 0000"
              />
              {errors.card && <p className="text-red-500 text-xs mt-1">{errors.card}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я на картці</label>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className={inputCls(errors.name)}
                placeholder="IVAN KOVALENKO"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Термін дії</label>
                <input
                  type="text" value={expiry} inputMode="numeric"
                  onChange={e => handleExpiryInput(e.target.value)}
                  className={inputCls(errors.expiry)}
                  placeholder="MM/YY"
                />
                {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="password" value={cvv} inputMode="numeric"
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={inputCls(errors.cvv)}
                  placeholder="•••"
                />
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mt-2"
            >
              Оплатити {auction.finalPrice?.toLocaleString()} ₴
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 Ця форма є демонстраційною. Реальних транзакцій не відбувається.
          </p>
        </div>
      </div>
    </div>
  );
}
