import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Language } from './types';
import { Toaster, toast } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import CatalogPage from './pages/CatalogPage';
import FavoritesPage from './pages/FavoritesPage';
import TutorialPage from './pages/TutorialPage';
import BridePage from './pages/BridePage';
import StoreView from './pages/StoreView';
import SupportButton from './components/SupportButton';
import { CustomerReviews } from './components/CustomerReviews';
import SplashScreen from './components/SplashScreen';
import { APP_LOGO, TRANSLATIONS, STORES, SOCIAL_LINKS } from './constants';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { DB, Order } from './services/storage';

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('collection_theme') as 'light' | 'dark') || 'light';
  });
  const [view, setView] = useState<'home' | 'auth' | 'cart' | 'checkout' | 'tracking' | 'admin' | 'catalog' | 'favorites' | 'tutorial' | 'store' | 'bride' | 'sale'>('home');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '' });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [triedSubmitting, setTriedSubmitting] = useState(false);
  
  const { cart, totalAmount, clearCart, syncCartWithOrders } = useCart();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { notifications, unreadCount, markAsRead, addNotification } = useNotifications();
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    if (user) {
      syncCartWithOrders();
      const interval = setInterval(syncCartWithOrders, 30000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const loadSettings = async () => {
      const sett = await DB.getSettings();
      setSettings(sett);
    };
    loadSettings();
  }, []);

  const handleRequestQuote = async () => {
    if (!user) {
      toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً لإتمام الطلب' : 'Please login first to complete your order');
      handleSetView('auth');
      return;
    }
    if (cart.length === 0) return;
    
    setOrderForm({ name: user.name || '', phone: '', address: '' });
    setTriedSubmitting(false);
    setShowOrderForm(true);
  };

  const submitOrder = async () => {
    setTriedSubmitting(true);
    if (!orderForm.name || !orderForm.phone || !orderForm.address) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const newOrder: Order = {
        id: orderId,
        userId: user!.id,
        userName: orderForm.name,
        userPhone: orderForm.phone,
        userAddress: orderForm.address,
        items: [...cart],
        total: totalAmount,
        date: new Date().toISOString(),
        status: 'awaiting_quote',
        paymentMethod: 'none' as any
      };

      await DB.saveOrder(newOrder);
      toast.success(lang === 'ar' ? 'تم طلب التسعير بنجاح!' : 'Quote requested successfully!');
      
      addNotification({
        title: 'Quote Requested!',
        titleAr: 'تم طلب التسعير!',
        message: `Your request #${orderId} has been sent to admin for pricing.`,
        messageAr: `تم إرسال طلبك رقم #${orderId} للإدارة لتحديد السعر النهائي.`,
        type: 'order'
      });

      setShowOrderForm(false);
      handleSetView('tracking');
    } catch (err) {
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء طلب التسعير' : 'Error requesting quote');
      console.error(err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        if (event.state.storeId) setSelectedStoreId(event.state.storeId);
        if (event.state.productId) setSelectedProductId(event.state.productId);
      } else {
        setView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '', '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem('collection_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isRTL = lang === 'ar';

  const handleSetView = (newView: any, storeId?: string, productId?: string) => {
    if (newView === view && storeId === selectedStoreId && productId === selectedProductId) return;
    setView(newView);
    if (storeId) setSelectedStoreId(storeId);
    if (productId) setSelectedProductId(productId);
    setIsMenuOpen(false);
    setIsNotifOpen(false);
    window.history.pushState({ view: newView, storeId, productId }, '', '');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleSetView('home');
    }
  };

  const NavLink = ({ target, label, isHighlight, onClick }: { target?: any, label: string, isHighlight?: boolean, onClick?: () => void }) => (
    <button 
      onClick={onClick || (() => handleSetView(target))}
      className={`relative py-2 text-[12px] md:text-[14px] font-black uppercase tracking-[0.1em] transition-all group whitespace-nowrap ${view === target ? 'text-white' : isHighlight ? 'text-rose-500' : 'text-white/60 hover:text-white'}`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isHighlight ? 'bg-rose-500' : 'bg-white'} transition-all duration-300 transform origin-left ${view === target ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
    </button>
  );

  const scrollToSection = (id: string) => {
    handleSetView('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderView = () => {
    switch (view) {
      case 'home': return <HomePage lang={lang} setView={handleSetView} />;
      case 'auth': return <AuthPage lang={lang} onAuthSuccess={() => handleSetView('home')} setView={handleSetView} />;
      case 'cart': return <CartPage lang={lang} onCheckout={() => {
        if (!user) {
          toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً لإتمام الطلب' : 'Please login first to complete your order');
          handleSetView('auth');
          return;
        }
        handleSetView('checkout');
      }} onRequestQuote={handleRequestQuote} />;
      case 'checkout': return <CheckoutPage lang={lang} onComplete={() => handleSetView('home')} />;
      case 'tracking': return <TrackingPage lang={lang} />;
      case 'admin': return <AdminDashboard lang={lang} />;
      case 'catalog': return <CatalogPage lang={lang} initialProductId={selectedProductId || undefined} />;
      case 'sale': return <CatalogPage lang={lang} showOnlyDiscounted initialProductId={selectedProductId || undefined} />;
      case 'flash-sale': return <CatalogPage lang={lang} showOnlyFlashSale initialProductId={selectedProductId || undefined} />;
      case 'offers': return <CatalogPage lang={lang} showOnlyOffers initialProductId={selectedProductId || undefined} />;
      case 'bride': return <BridePage lang={lang} />;
      case 'bride-all': return <BridePage lang={lang} showAll />;
      case 'favorites': return <FavoritesPage lang={lang} />;
      case 'tutorial': return <TutorialPage lang={lang} setView={handleSetView} />;
      case 'store': return selectedStoreId ? <StoreView lang={lang} storeId={selectedStoreId} onBack={() => handleBack()} /> : <HomePage lang={lang} setView={handleSetView} />;
      default: return <HomePage lang={lang} setView={handleSetView} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-[#f5f1e8] text-[#1a2b4c]'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {showSplash && <SplashScreen />}
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="bg-[#f5f1e8] text-[#1a2b4c] py-1.5 md:py-2 px-4 text-center text-[9px] md:text-[12px] font-black uppercase tracking-wider border-b border-[#1a2b4c]/10">
        {lang === 'ar' ? (settings.topBarAr || t('siteIdentity')) : (settings.topBarEn || t('siteIdentity'))}
      </div>

      <header className="sticky top-0 z-[100] bg-[#1a2b4c] border-b border-white/10 h-14 md:h-16 flex items-center shadow-2xl transition-all">
        <div className="container mx-auto px-4 md:px-12 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            {view !== 'home' && (
              <button onClick={handleBack} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-white hover:text-white/70 transition-all">
                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xs md:text-sm`}></i>
              </button>
            )}
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => handleSetView('home')}>
              <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center p-1 transition-all group-hover:scale-110">
                <img src={APP_LOGO} alt="Logo" className="w-full h-full object-contain drop-shadow-[0_2px_5px_rgba(255,255,255,0.3)]" onError={(e) => { (e.target as HTMLImageElement).src = "https://img.icons8.com/ios-filled/100/ffffff/crown.png"; }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xl lg:text-2xl font-black tracking-tighter text-white leading-none uppercase">{t('welcome')}</span>
                <span className="hidden sm:block text-[6px] md:text-[8px] text-white/60 font-bold uppercase tracking-[0.2em] mt-0.5">Unified Global Logistics</span>
              </div>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-6 lg:gap-8">
            <NavLink target="home" label={lang === 'ar' ? 'الرئيسية' : 'Home'} />
            <NavLink target="catalog" label={lang === 'ar' ? 'المتجر' : 'Shop'} />
            <NavLink label={lang === 'ar' ? 'من نحن' : 'About Us'} onClick={() => scrollToSection('about-us')} />
            <NavLink label={lang === 'ar' ? 'كيف تعمل الخدمة' : 'How it works'} onClick={() => scrollToSection('how-it-works')} />
            <NavLink target="bride" label={lang === 'ar' ? 'العروسة' : 'Bride'} isHighlight />
            <NavLink target="tracking" label={lang === 'ar' ? 'تتبع طلبك' : 'Tracking'} />
            {user?.isAdmin && <NavLink target="admin" label={lang === 'ar' ? 'الإدارة' : 'Admin'} />}
          </nav>

          <div className="flex items-center gap-1 md:gap-6">
            <div className="flex items-center gap-0.5 md:gap-4">
              <button onClick={() => setView('cart')} className="p-1 md:p-3 text-white/70 hover:text-white relative transition-colors">
                <i className="fa-solid fa-cart-shopping text-base md:text-2xl"></i>
                {cart.length > 0 && <span className="absolute top-0 right-0 md:top-1 md:right-1 bg-rose-500 text-white text-[6px] md:text-[10px] font-black w-3 h-3 md:w-5 md:h-5 rounded-full flex items-center justify-center ring-1 ring-[#1a2b4c]">{cart.length}</span>}
              </button>
              <button onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) markAsRead(); }} className="p-1 md:p-3 text-white/70 hover:text-white relative transition-colors">
                <i className="fa-solid fa-bell text-base md:text-2xl"></i>
                {unreadCount > 0 && <span className="absolute top-0 right-0 md:top-1 md:right-1 bg-[#c4a76d] text-[#1a2b4c] text-[6px] md:text-[10px] font-black w-3 h-3 md:w-5 md:h-5 rounded-full flex items-center justify-center ring-1 ring-[#1a2b4c]">{unreadCount}</span>}
              </button>
              <button onClick={() => handleSetView('auth')} className="hidden md:flex p-3 text-white/70 hover:text-white transition-colors">
                <i className="fa-solid fa-circle-user text-2xl"></i>
              </button>
              
              {isNotifOpen && (
                <div className="absolute top-full mt-2 right-0 md:right-12 w-72 md:w-96 bg-white dark:bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up z-[500]">
                  <div className="p-4 bg-[#1a2b4c] border-b border-white/10 flex justify-between items-center">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{lang === 'en' ? 'Notifications' : 'الإشعارات'}</h5>
                    <button onClick={() => setIsNotifOpen(false)} className="text-white/60 hover:text-white"><i className="fa-solid fa-times"></i></button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase">
                        {lang === 'en' ? 'No Notifications' : 'لا توجد إشعارات'}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-[#c4a76d]/5' : ''}`}>
                          <div className="flex gap-3">
                             <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${n.type === 'order' ? 'bg-green-500/10 text-green-500' : 'bg-[#c4a76d]/10 text-[#c4a76d]'}`}>
                                <i className={`fa-solid ${n.type === 'order' ? 'fa-box-check' : 'fa-bell'} text-xs`}></i>
                             </div>
                             <div className="space-y-1">
                                <h6 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{lang === 'en' ? n.title : n.titleAr}</h6>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{lang === 'en' ? n.message : n.messageAr}</p>
                                <span className="text-[7px] text-slate-400 uppercase">{new Date(n.date).toLocaleString()}</span>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden p-1 text-white hover:bg-white/10 rounded-lg transition-all">
              <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars-staggered'} text-base md:text-2xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Menu (Solid Color Sidebar, Transparent Overlay) */}
        <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`absolute top-0 bottom-0 w-1/2 bg-[#1a2b4c] border-x border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${isRTL ? 'left-0' : 'right-0'} ${isMenuOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')}`}>
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <img src={APP_LOGO} alt="Logo" className="w-6 h-6 object-contain" />
                <span className="text-white font-black text-sm uppercase tracking-wider">Collection</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-white/70 transition-colors p-1">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex-1 py-2 flex flex-col overflow-y-auto">
              {[
                { id: 'home', label: lang === 'ar' ? 'الرئيسية' : 'Home' },
                { id: 'catalog', label: lang === 'ar' ? 'المنتجات' : 'Products' },
                { id: 'bride', label: lang === 'ar' ? 'العروسة' : 'Bride' },
                { id: 'tracking', label: lang === 'ar' ? 'تتبع الطلب' : 'Order Tracking' },
                { id: 'favorites', label: lang === 'ar' ? 'المفضلة' : 'Favorites' },
                { id: 'about-us', label: lang === 'ar' ? 'من نحن' : 'About Us', action: () => { handleSetView('home'); setTimeout(() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { id: 'how-it-works', label: lang === 'ar' ? 'كيف تعمل الخدمة' : 'How it works', action: () => { handleSetView('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { id: 'auth', label: lang === 'ar' ? 'حسابي' : 'Account' },
                ...(user?.isAdmin ? [{ id: 'admin', label: lang === 'ar' ? 'الإدارة' : 'Admin' }] : []),
                { id: 'lang', label: lang === 'ar' ? 'English' : 'العربية', icon: 'fa-globe', action: () => { setLang(l => l === 'en' ? 'ar' : 'en'); setIsMenuOpen(false); } },
                { id: 'theme', label: theme === 'light' ? (lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode') : (lang === 'ar' ? 'الوضع النهاري' : 'Light Mode'), icon: theme === 'light' ? 'fa-moon' : 'fa-sun', action: () => { setTheme(t => t === 'light' ? 'dark' : 'light'); setIsMenuOpen(false); } },
              ].map((item) => (
                <button key={item.id} onClick={() => { if (item.action) { item.action(); } else { handleSetView(item.id as any); } setIsMenuOpen(false); }} className="w-full py-3.5 px-5 text-start text-white hover:bg-white/5 transition-all border-b border-white/5 flex items-center gap-3">
                  {item.icon && <i className={`fa-solid ${item.icon} text-xs text-[#c4a76d]`}></i>}
                  <span className="text-[13px] font-medium uppercase tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-white/10 text-center text-white/40 text-[9px] font-medium uppercase">Collection Yemen &copy; {new Date().getFullYear()}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-12 py-4 md:py-12">{renderView()}</div>
      </main>

      {view === 'home' && <CustomerReviews lang={lang} />}

      <footer className="bg-[#1a2b4c] border-t border-white/10 py-8 md:py-12 text-white/70">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-right">
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('home')}>
              <img src={APP_LOGO} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_5px_15px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-110" alt="Logo" />
              <span className="text-lg md:text-2xl font-black text-white tracking-tighter uppercase">{t('welcome')}</span>
            </div>
            <p className="text-[10px] md:text-[12px] leading-relaxed max-w-xs opacity-70">{t('heroDesc')}</p>
            <div className="flex gap-3">
              {Object.entries(SOCIAL_LINKS).map(([key, url]) => (
                <a key={key} href={url} target="_blank" className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-base md:text-lg">
                  <i className={`fa-brands fa-${key === 'x' ? 'x-twitter' : key}`}></i>
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest">روابط سريعة</h4>
            <div className="flex flex-col gap-2 text-[10px] md:text-[12px] font-medium">
              <span onClick={() => setView('catalog')} className="hover:text-[#c4a76d] cursor-pointer transition-colors">{t('allProducts')}</span>
              <span onClick={() => scrollToSection('about-us')} className="hover:text-[#c4a76d] cursor-pointer transition-colors">{t('aboutUs')}</span>
              <span onClick={() => scrollToSection('how-it-works')} className="hover:text-[#c4a76d] cursor-pointer transition-colors">{lang === 'ar' ? 'كيف تعمل الخدمة' : 'How it works'}</span>
              <span onClick={() => setView('favorites')} className="hover:text-[#c4a76d] cursor-pointer transition-colors">{lang === 'ar' ? 'المفضلة' : 'Favorites'}</span>
              <span onClick={() => setView('tracking')} className="hover:text-[#c4a76d] cursor-pointer transition-colors">تتبع طلبك</span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest">المتاجر المدعومة</h4>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-medium opacity-80">
              {STORES.slice(0, 8).map(store => <a key={store.id} href={store.url} target="_blank" className="hover:text-[#c4a76d] transition-all">{lang === 'ar' ? store.nameAr : store.name}</a>)}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest">تواصل معنا</h4>
            <div className="flex flex-col gap-2 text-[10px] md:text-[12px] font-medium items-center md:items-start">
              <div className="flex items-center gap-2"><i className="fa-solid fa-location-dot text-[#c4a76d] text-xs"></i> <span>اليمن - إب</span></div>
              <div className="flex items-center gap-2" dir="ltr"><i className="fa-solid fa-phone text-[#c4a76d] text-xs"></i> <span>+967 774757728</span></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 md:px-12 mt-8 md:mt-10 pt-6 border-t border-white/5 text-[8px] md:text-[9px] text-center uppercase font-medium tracking-[0.2em] opacity-50">
          <span>&copy; {new Date().getFullYear()} Collection Yemen Store. All rights reserved.</span>
        </div>
      </footer>
      {/* SupportButton removed as per user request */}

      {/* Order Confirmation Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-slide-up">
            <div className="bg-[#1a2b4c] p-6 text-center relative">
              <button 
                onClick={() => setShowOrderForm(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-file-signature text-3xl text-[#c4a76d]"></i>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">
                {lang === 'ar' ? 'تأكيد بيانات الطلب' : 'Confirm Order Details'}
              </h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                {lang === 'ar' ? 'يرجى تزويدنا ببيانات التواصل لإتمام الطلب' : 'Please provide contact details to complete your order'}
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest px-2 transition-colors ${triedSubmitting && !orderForm.name ? 'text-rose-500' : 'text-slate-400'}`}>
                  {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className={triedSubmitting && !orderForm.name ? 'text-rose-500' : 'text-rose-400'}>*</span>
                </label>
                <div className="relative">
                  <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${triedSubmitting && !orderForm.name ? 'text-rose-300' : 'text-slate-300'}`}></i>
                  <input 
                    type="text"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none ${triedSubmitting && !orderForm.name ? 'border-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.1)]' : 'border-slate-100 dark:border-white/5 focus:border-[#c4a76d]'}`}
                    placeholder={lang === 'ar' ? 'ادخل اسمك هنا...' : 'Enter your name...'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest px-2 transition-colors ${triedSubmitting && !orderForm.phone ? 'text-rose-500' : 'text-slate-400'}`}>
                  {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'} <span className={triedSubmitting && !orderForm.phone ? 'text-rose-500' : 'text-rose-400'}>*</span>
                </label>
                <div className="relative">
                  <i className={`fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${triedSubmitting && !orderForm.phone ? 'text-rose-300' : 'text-slate-300'}`}></i>
                  <input 
                    type="tel"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none ${triedSubmitting && !orderForm.phone ? 'border-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.1)]' : 'border-slate-100 dark:border-white/5 focus:border-[#c4a76d]'}`}
                    placeholder={lang === 'ar' ? '77xxxxxxx' : '77xxxxxxx'}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest px-2 transition-colors ${triedSubmitting && !orderForm.address ? 'text-rose-500' : 'text-slate-400'}`}>
                  {lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'} <span className={triedSubmitting && !orderForm.address ? 'text-rose-500' : 'text-rose-400'}>*</span>
                </label>
                <div className="relative">
                  <i className={`fa-solid fa-location-dot absolute left-4 top-4 transition-colors ${triedSubmitting && !orderForm.address ? 'text-rose-300' : 'text-slate-300'}`}></i>
                  <textarea 
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none min-h-[100px] resize-none ${triedSubmitting && !orderForm.address ? 'border-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.1)]' : 'border-slate-100 dark:border-white/5 focus:border-[#c4a76d]'}`}
                    placeholder={lang === 'ar' ? 'المدينة، الشارع، المعالم القريبة...' : 'City, Street, Landmarks...'}
                  />
                </div>
              </div>

              <button 
                onClick={submitOrder}
                disabled={isSubmittingOrder}
                className="w-full bg-[#1a2b4c] text-white py-5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmittingOrder ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {lang === 'ar' ? 'تأكيد وإرسال الطلب' : 'Confirm & Send Order'}
                    <i className="fa-solid fa-paper-plane"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <FavoritesProvider>
      <CartProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </CartProvider>
    </FavoritesProvider>
  </AuthProvider>
);

export default App;