import mixpanel from 'mixpanel-browser';

const TOKEN = '774b951bae72d9f0a75125693dda3bc8'; // замінити на свій токен з mixpanel.com

mixpanel.init(TOKEN, {
  debug: import.meta.env.DEV,        // логи в консолі лише в dev-режимі
  track_pageview: false,             // вимкнено — керуємо вручну через PageTracker
  persistence: 'localStorage',
});

export const mp = {
  // Ідентифікація користувача (після логіну)
  identify: (userId: number, name: string, email: string, role: string) => {
    mixpanel.identify(String(userId));
    mixpanel.people.set({ $name: name, $email: email, role });
  },

  // Скидання при логауті
  reset: () => mixpanel.reset(),

  // Перегляд сторінки
  pageView: (path: string, title: string) => {
    mixpanel.track('Page View', { path, title });
  },

  // Перегляд аукціону
  viewAuction: (auctionId: number, type: string, artist: string, title: string) => {
    mixpanel.track('View Auction', { auction_id: auctionId, auction_type: type, artist, title });
  },

  // Ставка (Vickrey)
  placeBid: (auctionId: number, amount: number, artist: string, title: string) => {
    mixpanel.track('Place Bid', { auction_id: auctionId, amount, artist, title, currency: 'UAH' });
  },

  // Купити зараз (Dutch)
  buyNow: (auctionId: number, price: number, artist: string, title: string) => {
    mixpanel.track('Buy Now', { auction_id: auctionId, price, artist, title, currency: 'UAH' });
  },

  // Оплата
  beginCheckout: (auctionId: number, amount: number) => {
    mixpanel.track('Begin Checkout', { auction_id: auctionId, amount, currency: 'UAH' });
  },
  purchase: (auctionId: number, amount: number, artist: string, title: string) => {
    mixpanel.track('Purchase', { auction_id: auctionId, amount, artist, title, currency: 'UAH' });
    mixpanel.people.track_charge(amount); // рахує lifetime value
  },

  // Авторизація
  login: (userId: number, name: string, email: string, role: string) => {
    mp.identify(userId, name, email, role);
    mixpanel.track('Login', { role });
  },
  signUp: (userId: number, name: string, email: string, role: string) => {
    mp.identify(userId, name, email, role);
    mixpanel.track('Sign Up', { role });
    mixpanel.people.set_once({ $created: new Date().toISOString() });
  },

  // Каталог
  search: (query: string, resultsCount: number) => {
    mixpanel.track('Search', { query, results_count: resultsCount });
  },
  filterCatalog: (filterType: string, filterValue: string) => {
    mixpanel.track('Filter Catalog', { filter_type: filterType, filter_value: filterValue });
  },

  // Адмін
  moderateLot: (lotId: number, action: 'approve' | 'reject') => {
    mixpanel.track('Moderate Lot', { lot_id: lotId, action });
  },

  // Продавець
  createLot: (auctionType: string) => {
    mixpanel.track('Create Lot', { auction_type: auctionType });
  },
};
