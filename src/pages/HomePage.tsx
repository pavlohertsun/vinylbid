import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AuctionCard from '../components/AuctionCard';

export default function HomePage() {
  const { auctions, lots, records } = useApp();

  const featuredAuctions = auctions
    .filter(a => a.status === 'active')
    .slice(0, 4)
    .map(a => {
      const lot = lots.find(l => l.id === a.lotId);
      const record = records.find(r => lot && r.id === lot.recordId);
      return { auction: a, record };
    })
    .filter((x): x is { auction: typeof x.auction; record: NonNullable<typeof x.record> } => !!x.record);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
              Аукціони вінілових платівок для справжніх колекціонерів
            </h1>
            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
              Голландські аукціони та торги за методом Vickrey. Верифіковані лоти від перевірених продавців.
            </p>
            <div className="flex gap-3">
              <Link
                to="/catalog"
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Переглянути аукціони
              </Link>
              <Link
                to="/register"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Зареєструватись
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: `${auctions.filter(a => a.status === 'active').length}`, label: 'Активних аукціонів' },
            { value: '2', label: 'Формати торгів' },
            { value: '100%', label: 'Верифіковані лоти' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Активні аукціони</h2>
            <Link to="/catalog" className="text-sm text-gray-500 hover:text-black transition-colors">
              Всі аукціони →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredAuctions.map(({ auction, record }) => (
              <AuctionCard key={auction.id} auction={auction} record={record} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Як це працює</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Голландський аукціон', desc: 'Ціна автоматично знижується з часом. Натисніть «Купити» у будь-який момент — лот ваш за поточною ціною.' },
              { step: '02', title: 'Аукціон Vickrey', desc: 'Надішліть запечатану ставку до дедлайну. Перемагає найвища ставка, але переможець платить ціну другої найвищої.' },
              { step: '03', title: 'Верифікація лотів', desc: 'Кожен лот перевіряється адміністратором перед публікацією. Оцінка стану — за шкалою Goldmine.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <span className="text-3xl font-bold text-gray-200 shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
