const GA_ID = 'G-PX7THSZNY2';

declare function gtag(...args: unknown[]): void;

const g = (...args: unknown[]) => {
  if (typeof gtag !== 'undefined') gtag(...args);
};

export const analytics = {
  // Перегляд сторінки (викликається при кожній зміні маршруту)
  pageView: (path: string, title: string) => {
    g('config', GA_ID, { page_path: path, page_title: title });
  },

  // Авторизація
  login: (role: string) => {
    g('event', 'login', { method: 'email', user_role: role });
  },
  signUp: (role: string) => {
    g('event', 'sign_up', { method: 'email', user_role: role });
  },

  // Перегляд аукціону
  viewAuction: (auctionId: number, auctionType: string, artist: string, title: string, price: number) => {
    g('event', 'view_item', {
      items: [{ item_id: String(auctionId), item_name: `${artist} — ${title}`, item_category: auctionType, price }],
    });
  },

  // Ставка (Vickrey)
  placeBid: (auctionId: number, amount: number, artist: string, title: string) => {
    g('event', 'place_bid', {
      auction_id: auctionId,
      bid_amount: amount,
      item_name: `${artist} — ${title}`,
      currency: 'UAH',
    });
  },

  // Купити зараз (Dutch)
  buyNow: (auctionId: number, price: number, artist: string, title: string) => {
    g('event', 'buy_now', {
      auction_id: auctionId,
      price,
      item_name: `${artist} — ${title}`,
      currency: 'UAH',
    });
  },

  // Перехід до оплати
  beginCheckout: (auctionId: number, amount: number) => {
    g('event', 'begin_checkout', {
      auction_id: auctionId,
      value: amount,
      currency: 'UAH',
    });
  },

  // Успішна оплата
  purchase: (auctionId: number, amount: number, artist: string, title: string) => {
    g('event', 'purchase', {
      transaction_id: `auction_${auctionId}_${Date.now()}`,
      value: amount,
      currency: 'UAH',
      items: [{ item_id: String(auctionId), item_name: `${artist} — ${title}`, price: amount }],
    });
  },

  // Пошук у каталозі
  search: (query: string) => {
    g('event', 'search', { search_term: query });
  },

  // Фільтрація каталогу
  filterCatalog: (filterType: string, filterValue: string) => {
    g('event', 'filter_catalog', { filter_type: filterType, filter_value: filterValue });
  },

  // Адмін: схвалення/відхилення лоту
  moderateLot: (lotId: number, action: 'approve' | 'reject') => {
    g('event', 'moderate_lot', { lot_id: lotId, action });
  },

  // Додавання лоту продавцем
  createLot: (auctionType: string) => {
    g('event', 'create_lot', { auction_type: auctionType });
  },
};
