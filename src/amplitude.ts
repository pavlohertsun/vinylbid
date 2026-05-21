import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('92dd249c3707b828f10d0fde5b7239df', {
  autocapture: true,               // автоматичний захват кліків, форм, переходів
  defaultTracking: {
    pageViews: false,              // вимкнено — керуємо вручну
    sessions: true,
    formInteractions: true,
    fileDownloads: true,
  },
});

export const amp = {
  // Ідентифікація користувача
  identify: (userId: number, name: string, email: string, role: string) => {
    amplitude.setUserId(String(userId));
    const identifyObj = new amplitude.Identify();
    identifyObj.set('name', name);
    identifyObj.set('email', email);
    identifyObj.set('role', role);
    amplitude.identify(identifyObj);
  },

  reset: () => amplitude.reset(),

  // Перегляд сторінки
  pageView: (path: string, title: string) => {
    amplitude.track('Page View', { path, title });
  },

  // Авторизація
  login: (userId: number, name: string, email: string, role: string) => {
    amp.identify(userId, name, email, role);
    amplitude.track('Login', { role });
  },
  signUp: (userId: number, name: string, email: string, role: string) => {
    amp.identify(userId, name, email, role);
    amplitude.track('Sign Up', { role });
  },

  // Аукціон
  viewAuction: (auctionId: number, type: string, artist: string, title: string) => {
    amplitude.track('View Auction', { auction_id: auctionId, auction_type: type, artist, title });
  },
  placeBid: (auctionId: number, amount: number, artist: string, title: string) => {
    amplitude.track('Place Bid', { auction_id: auctionId, amount, artist, title, currency: 'UAH' });
  },
  buyNow: (auctionId: number, price: number, artist: string, title: string) => {
    amplitude.track('Buy Now', { auction_id: auctionId, price, artist, title, currency: 'UAH' });
  },

  // Оплата
  beginCheckout: (auctionId: number, amount: number) => {
    amplitude.track('Begin Checkout', { auction_id: auctionId, amount, currency: 'UAH' });
  },
  purchase: (auctionId: number, amount: number, artist: string, title: string) => {
    amplitude.track('Purchase', { auction_id: auctionId, amount, artist, title, currency: 'UAH' });
  },

  // Каталог
  search: (query: string, resultsCount: number) => {
    amplitude.track('Search', { query, results_count: resultsCount });
  },
  filterCatalog: (filterType: string, filterValue: string) => {
    amplitude.track('Filter Catalog', { filter_type: filterType, filter_value: filterValue });
  },

  // Адмін / продавець
  moderateLot: (lotId: number, action: 'approve' | 'reject') => {
    amplitude.track('Moderate Lot', { lot_id: lotId, action });
  },
  createLot: (auctionType: string) => {
    amplitude.track('Create Lot', { auction_type: auctionType });
  },
};
