import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Неправильний email або пароль');
    } else {
      navigate('/catalog');
    }
  };

  const demoUsers = [
    { label: 'Admin', email: 'admin@vinylbid.com', password: 'admin123' },
    { label: 'Продавець', email: 'john@mail.com', password: 'pass123' },
    { label: 'Покупець', email: 'alex@mail.com', password: 'pass123' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <Link to="/" className="block text-center font-bold text-xl tracking-tight mb-8">
            VINYL<span className="text-gray-400">BID</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mb-6">Увійти до акаунту</h1>

          {/* Demo shortcuts */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Швидкий вхід (демо):</p>
            <div className="flex gap-2 flex-wrap">
              {demoUsers.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Увійти
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Немає акаунту?{' '}
            <Link to="/register" className="text-black font-medium hover:underline">
              Зареєструватись
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
