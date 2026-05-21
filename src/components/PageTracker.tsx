import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../analytics';
import { mp } from '../mixpanel';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Головна',
  '/catalog': 'Каталог аукціонів',
  '/login': 'Увійти',
  '/register': 'Реєстрація',
  '/admin': 'Модерація',
  '/create-lot': 'Додати лот',
  '/profile': 'Профіль',
};

export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const title =
      PAGE_TITLES[location.pathname] ??
      (location.pathname.startsWith('/auction/') ? 'Аукціон' :
       location.pathname.startsWith('/payment/') ? 'Оплата' : 'VinylBid');
    analytics.pageView(location.pathname, title);
    mp.pageView(location.pathname, title);
  }, [location.pathname]);

  return null;
}
