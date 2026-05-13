import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' as 'buyer' | 'seller' });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!register(form.name, form.email, form.password, form.role)) {
      setError('Цей email вже зареєстровано');
    } else {
      navigate('/catalog');
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} required
        value={form[key] as string}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <Link to="/" className="block text-center font-bold text-xl tracking-tight mb-8">
            VINYL<span className="text-gray-400">BID</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mb-6">Створити акаунт</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', "Ім'я", 'text', "Ваше ім'я")}
            {field('email', 'Email', 'email', 'your@email.com')}
            {field('password', 'Пароль', 'password', '••••••••')}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <div className="grid grid-cols-2 gap-2">
                {(['buyer', 'seller'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role }))}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      form.role === role
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {role === 'buyer' ? 'Покупець' : 'Продавець'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {form.role === 'buyer' ? 'Берете участь у торгах' : 'Виставляєте лоти на аукціон'}
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Зареєструватись
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Вже маєте акаунт?{' '}
            <Link to="/login" className="text-black font-medium hover:underline">Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
