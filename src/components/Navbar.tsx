import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path ? 'text-black font-medium' : 'text-gray-500 hover:text-black';

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight text-black">
          VINYL<span className="text-gray-400">BID</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/catalog" className={`text-sm transition-colors ${isActive('/catalog')}`}>
            Каталог
          </Link>
          {user?.role === 'seller' && (
            <Link to="/create-lot" className={`text-sm transition-colors ${isActive('/create-lot')}`}>
              Додати лот
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`text-sm transition-colors ${isActive('/admin')}`}>
              Модерація
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className={`text-sm transition-colors ${isActive('/profile')}`}>
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-black transition-colors">
                Увійти
              </Link>
              <Link
                to="/register"
                className="text-sm bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
              >
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
