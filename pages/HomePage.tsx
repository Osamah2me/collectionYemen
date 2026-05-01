
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Zap, 
  Gem, 
  ArrowLeft, 
  ArrowRight, 
  Bolt, 
  Link as LinkIcon, 
  Calculator, 
  Wallet, 
  Truck, 
  Banknote, 
  MapPin, 
  MessageCircle, 
  Headphones, 
  RotateCcw, 
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Watch,
  Smile,
  Camera,
  Flower2,
  ListChecks,
  HeartIcon
} from 'lucide-react';
import { Language, LocalProduct, AppSettings } from '../types';
import { STORES, TRANSLATIONS, APP_LOGO, FLASH_SALE_END_TIME } from '../constants';
import { DB } from '../services/storage';

interface Props {
  lang: Language;
  setView: (view: any, storeId?: string) => void;
}

const HomePage: React.FC<Props> = ({ lang, setView }) => {
  const [offerProducts, setOfferProducts] = useState<LocalProduct[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<LocalProduct[]>([]);
  const [brideProducts, setBrideProducts] = useState<LocalProduct[]>([]);
  const [reviews, setReviews] = useState([
    { id: 1, name: 'أحمد محمد', rating: 5, comment: 'خدمة ممتازة وسرعة في التوصيل. طلبت من أمازون ووصلني الطلب في وقت قياسي.', image: 'https://picsum.photos/seed/user1/100/100' },
    { id: 2, name: 'سارة علي', rating: 5, comment: 'أفضل وسيط شراء في اليمن. تعامل راقي ودقة في المواعيد.', image: 'https://picsum.photos/seed/user2/100/100' },
    { id: 3, name: 'خالد عبدالله', rating: 4, comment: 'تجربة رائعة، التتبع دقيق جداً وخدمة العملاء متعاونة.', image: 'https://picsum.photos/seed/user3/100/100' },
  ]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [flashSaleEnd, setFlashSaleEnd] = useState(FLASH_SALE_END_TIME);
  const [customAboutUs, setCustomAboutUs] = useState<{ar?: string, en?: string}>({});
  const [settings, setSettings] = useState<AppSettings>({});
  const [bannerIndex, setBannerIndex] = useState(0);

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  useEffect(() => {
    const loadSettings = async () => {
      const sett = await DB.getSettings();
      setSettings(sett);
      if (sett.flashSaleEndTime) {
        setFlashSaleEnd(sett.flashSaleEndTime);
      }
      if (sett.aboutUsAr || sett.aboutUsEn) {
        setCustomAboutUs({ ar: sett.aboutUsAr, en: sett.aboutUsEn });
      }
    };
    loadSettings();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  };

  useEffect(() => {
    const banners = (settings as any).banners || [];
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % banners.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [settings]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(flashSaleEnd).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleEnd]);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await DB.getProducts();
      setOfferProducts(allProducts.filter(p => p.isOffer || p.isDiscounted));
      setFlashSaleProducts(allProducts.filter(p => p.isFlashSale));
      setBrideProducts(allProducts.filter(p => p.isBride));
    };
    loadProducts();
  }, []);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    const id = reviews.length + 1;
    setReviews([{ ...newReview, id, image: `https://picsum.photos/seed/user${id}/100/100` }, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ name: '', comment: '', rating: 5 });
  };

  const PortalCard = ({ title, subtitle, icon, buttonText, onClick }: any) => (
    <motion.div 
      variants={itemVariants}
      animate="visible"
      whileHover={{ y: -12, transition: { duration: 0.4, ease: "easeOut" } }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-10 border border-[#e0e0e0] dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center justify-between overflow-visible w-full min-h-[220px] md:min-h-[280px] lg:min-h-[320px]"
    >
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <div className={`w-16 h-16 md:w-20 md:h-20 bg-[#1a2b4c]/5 dark:bg-white/10 rounded-2xl flex items-center justify-center text-[#1a2b4c] dark:text-[#c4a76d] shadow-inner group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        
        <div className="space-y-1">
          <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#c4a76d]">{subtitle}</h4>
          <h3 className="text-[15px] md:text-[20px] font-black text-[#1a2b4c] dark:text-white leading-tight px-1">{title}</h3>
        </div>
      </div>

      <div className="relative z-10 w-full pt-4">
        <button 
          onClick={onClick}
          className="w-full md:w-fit mx-auto bg-[#1a2b4c] text-white px-6 md:px-10 py-2.5 md:py-3.5 rounded-xl font-black text-[11px] md:text-[14px] shadow-lg hover:bg-[#253b66] hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {buttonText}
          {lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 md:space-y-12 pb-12 overflow-hidden">
      {/* Premium Hero Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative min-h-[350px] md:min-h-[500px] lg:min-h-[600px] rounded-[1.25rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group flex items-center bg-[#1a2b4c]"
      >
        {/* Background Image / Placeholder */}
        <div className="absolute inset-0 z-0">
          {settings.heroImageUrl ? (
            <img 
              src={settings.heroImageUrl} 
              className="w-full h-full object-cover opacity-60 transition-transform duration-[20s] group-hover:scale-110" 
              alt="" 
            />
          ) : (
            <div className="w-full h-full bg-[#1a2b4c]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1a2b4c] via-[#1a2b4c]/80 md:via-[#1a2b4c]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 py-12 md:py-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-lg lg:max-w-3xl space-y-4 md:space-y-8 text-center md:text-start"
          >
            <motion.div variants={itemVariants} className="space-y-1 md:space-y-1.5">
              <span className="inline-block bg-[#c4a76d] text-[#1a2b4c] px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[7px] md:text-[10px] premium-text shadow-lg">
                {t('premiumExperience')}
              </span>
              <h1 className="text-[22px] md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter uppercase drop-shadow-lg">
                {t('discoverPremium')}<br />
                <span className="text-[#c4a76d]">{t('welcome')}</span>
              </h1>
              <p className="text-white/95 text-[9px] md:text-sm lg:text-base premium-subtitle max-w-md mx-auto md:mx-0 drop-shadow-md">
                {t('heroSubtitle')}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center md:justify-start gap-2.5 md:gap-4">
              <button 
                onClick={() => {
                  const el = document.getElementById('how-to-shop');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-fit mx-auto md:mx-0 bg-[#c4a76d] text-[#1a2b4c] px-6 md:px-10 py-2.5 md:py-4 rounded-lg md:rounded-xl font-black text-[10px] md:text-base shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {t('exploreNow')}
                {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
              <button 
                onClick={() => setView('catalog')}
                className="w-fit mx-auto md:mx-0 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 md:px-10 py-2.5 md:py-4 rounded-lg md:rounded-xl font-black text-[10px] md:text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                {t('shopNow')}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center md:justify-start gap-6 md:gap-12 pt-6 md:pt-12">
              <div className="text-center md:text-start">
                <div className="text-sm md:text-3xl font-black text-white drop-shadow-sm">50k+</div>
                <div className="text-[7px] md:text-[11px] text-white/70 font-black uppercase tracking-[0.1em]">{t('ordersDelivered')}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center md:text-start">
                <div className="text-sm md:text-3xl font-black text-white drop-shadow-sm">10k+</div>
                <div className="text-[7px] md:text-[11px] text-white/70 font-black uppercase tracking-[0.1em]">{t('happyCustomers')}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center md:text-start">
                <div className="text-sm md:text-3xl font-black text-white drop-shadow-sm">12+</div>
                <div className="text-[7px] md:text-[11px] text-white/70 font-black uppercase tracking-[0.1em]">{t('countries')}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Banner Slider Section */}
      {settings.banners && settings.banners.length > 0 && (
        <motion.section 
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(${lang === 'ar' ? (bannerIndex * 100) : (-bannerIndex * 100)}%)` }}>
            {settings.banners.map((url: string, i: number) => (
              <div key={i} className="min-w-full relative">
                <img src={url} alt={`Banner ${i}`} className="w-full h-auto max-h-[250px] md:max-h-[320px] object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
          {settings.banners.length > 1 && (
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {settings.banners.map((_: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setBannerIndex(i)}
                  className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all ${bannerIndex === i ? 'bg-[#c4a76d] w-6 md:w-10' : 'bg-white/40'}`}
                ></button>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Portal Hero Section */}
      <motion.section 
        animate="visible"
        variants={containerVariants}
        id="how-to-shop" 
        className="space-y-8 md:space-y-12 scroll-mt-20 py-12 md:py-24"
      >
        <motion.div variants={itemVariants} animate="visible" className="text-center space-y-3 md:space-y-6">
          <h2 className="text-2xl md:text-6xl font-black text-[#1a2b4c] dark:text-white tracking-tighter uppercase leading-tight">
            {t('howToShopToday')}
          </h2>
          <div className="w-24 md:w-40 h-2 md:h-3 bg-[#c4a76d] mx-auto rounded-full shadow-sm"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <PortalCard 
            title={t('fromWorldToDoor')}
            subtitle={t('internationalShopping')}
            icon={<Globe size={32} />}
            buttonText={t('orderFromAbroad')}
            onClick={() => {
              const el = document.getElementById('global-stores');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            color="gold"
          />
          <PortalCard 
            title={t('wantSomethingFast')}
            subtitle={t('readyForDelivery')}
            icon={<Zap size={32} />}
            buttonText={t('shopNow')}
            onClick={() => setView('catalog')}
            color="blue"
          />
          <PortalCard 
            title={t('readyForNewStage')}
            subtitle={t('brideSection')}
            icon={<Gem size={32} />}
            buttonText={t('startPreparing')}
            onClick={() => setView('bride')}
            color="rose"
          />
        </div>
      </motion.section>

      {/* Bride Services Section */}
      <motion.section 
        animate="visible"
        variants={containerVariants}
        className="space-y-8 md:space-y-12 py-10 md:py-20"
      >
        <motion.div variants={itemVariants} animate="visible" className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 text-center md:text-right">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-3 text-[#c4a76d] font-black text-[10px] md:text-xs uppercase tracking-widest">
              <span className="bg-[#c4a76d]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Star size={10} className="fill-[#c4a76d] text-[#c4a76d]" /> 4.9/5
              </span>
              <span>{t('happyCustomersCount')}</span>
            </div>
            <h2 className="text-xl md:text-4xl font-black text-[#1a2b4c] dark:text-white tracking-tighter uppercase leading-tight">
              {t('brideServices')}
            </h2>
            <p className="text-[#7a7a7a] dark:text-slate-300 text-xs md:text-xl font-bold">
              {t('brideServicesSubtitle')}
            </p>
          </div>
          <button 
            onClick={() => setView('bride-all')}
            className="bg-[#1a2b4c] text-white px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:bg-[#253b66] active:scale-95 transition-all flex items-center gap-2.5 border border-white/10"
          >
            {t('viewAllServices')}
            {lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4 px-2 sm:px-0">
          {[
            { id: 'dresses', title: t('weddingDresses'), icon: <Sparkles className="text-rose-400" /> },
            { id: 'acc', title: t('accessories'), icon: <Gem className="text-[#c4a76d]" /> },
            { id: 'makeup', title: t('makeupArtists'), icon: <Smile className="text-pink-400" /> },
            { id: 'photo', title: t('photography'), icon: <Camera className="text-blue-400" /> },
            { id: 'bouquets', title: t('bridalBouquets'), icon: <Flower2 className="text-green-400" /> },
            { id: 'planning', title: t('weddingPlanning'), icon: <ListChecks className="text-indigo-400" /> },
            { id: 'invitations', title: t('invitationsGifts'), icon: <HeartIcon className="text-rose-500" /> },
          ].map((service, i) => (
            <motion.div 
              key={service.id} 
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="group bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl border border-[#e0e0e0] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col items-center text-center space-y-2 justify-center w-full min-h-[110px] md:min-h-[150px] mx-auto"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {service.icon}
              </div>
              <div className="space-y-0.5">
                <h3 className="font-black text-[#1a2b4c] dark:text-white text-[10px] md:text-[14px] uppercase tracking-tight leading-tight px-1">
                  {service.title}
                </h3>
              </div>
              <button 
                onClick={() => setView('bride')}
                className="w-fit px-4 md:px-6 bg-[#1a2b4c]/5 dark:bg-white/5 text-[#1a2b4c] dark:text-white py-1 md:py-2 rounded-lg font-black text-[8px] md:text-[11px] uppercase tracking-tighter hover:bg-[#1a2b4c] hover:text-white transition-all"
              >
                {t('bookNow')}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Flash Sale Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-10 md:space-y-16 bg-[#c4a76d]/5 dark:bg-[#c4a76d]/5 p-10 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-[#c4a76d]/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4a76d] opacity-[0.05] rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 relative z-10">
          <div className="space-y-2 md:space-y-4">
            <div className="inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-1 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest animate-pulse">
              <Bolt size={14} />
              {t('flashSale')}
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <h2 className="text-2xl md:text-5xl font-black text-[#1a2b4c] dark:text-white tracking-tighter uppercase leading-tight">
                {t('flashSale')}
              </h2>
            </div>
            <p className="text-[#7a7a7a] dark:text-slate-300 text-sm md:text-2xl font-bold max-w-xl mx-auto">
              {t('flashSaleSubtitle')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-[#1a2b4c] dark:text-white font-black text-xs md:text-xl uppercase tracking-widest opacity-60">
              {t('saleEndsIn')}:
            </p>
            <div className="flex items-center gap-3 md:gap-6">
              {[
                { value: timeLeft.hours, label: t('hours') },
                { value: timeLeft.minutes, label: t('minutes') },
                { value: timeLeft.seconds, label: t('seconds') }
              ].map((unit, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1 md:gap-2">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-[#1a2b4c] text-white rounded-xl md:rounded-3xl flex items-center justify-center text-2xl md:text-4xl font-black shadow-2xl">
                      {unit.value}
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#7a7a7a]">{unit.label}</span>
                  </div>
                  {i < 2 && <span className="text-2xl md:text-4xl font-black text-[#1a2b4c] dark:text-white mb-4 md:mb-8">:</span>}
                </React.Fragment>
              ))}
            </div>
            <button 
              onClick={() => setView('flash-sale')}
              className="mt-4 bg-[#1a2b4c] text-white px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-[#253b66] transition-all shadow-lg"
            >
              {t('viewAll')}
            </button>
          </div>
        </div>

        {/* Flash Sale Products - Auto Scrolling Marquee */}
        <div className="relative group/scroll overflow-hidden">
          <div className="flex gap-4 pt-6 md:pt-10 pb-6 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap w-max">
            {[...flashSaleProducts, ...flashSaleProducts].map((p, i) => (
              <div 
                key={`${p.id}-${i}`} 
                onClick={() => setView('catalog')}
                className="w-[130px] md:w-[180px] flex-shrink-0 group bg-white dark:bg-slate-900/40 rounded-xl overflow-hidden border border-[#e0e0e0] dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg">
                    -{Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100)}%
                  </div>
                </div>
                <div className="p-3 md:p-4 space-y-1 flex-1 flex flex-col justify-between">
                  <h4 className="font-black text-[#1a2b4c] dark:text-white text-[9px] md:text-[12px] uppercase truncate">
                    {lang === 'ar' ? p.nameAr : p.name}
                  </h4>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[#c4a76d] font-black text-[10px] md:text-[14px]">{p.price} SAR</span>
                    <span className="text-[#7a7a7a] line-through text-[7px] md:text-[10px] font-bold opacity-60">{p.oldPrice} SAR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll Indicator Arrow - Hidden for auto-scroll but kept for reference if needed */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 md:hidden animate-bounce-horizontal pointer-events-none opacity-0">
            <div className="bg-[#1a2b4c]/80 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
              {lang === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </div>
          </div>
        </div>
      </motion.section>

      {offerProducts.length > 0 && (
        <section className="space-y-10 md:space-y-16 py-10 md:py-20">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-right">
            <div className="space-y-3 md:space-y-4">
              <h2 className="text-2xl md:text-5xl font-black text-[#1a2b4c] dark:text-white tracking-tighter uppercase leading-tight">
                {t('offers')}
              </h2>
              <p className="text-[#7a7a7a] dark:text-slate-400 text-sm md:text-2xl font-bold">
                {t('discoverOffers')}
              </p>
            </div>
            <button 
              onClick={() => setView('offers')}
              className="bg-[#1a2b4c] text-white px-8 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl hover:bg-[#253b66] active:scale-95 transition-all flex items-center gap-3 border border-white/10"
            >
              {t('viewAll')}
              {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>

          <div className="relative group/offers overflow-hidden">
            <div className="flex gap-4 pb-6 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap w-max">
              {[...offerProducts, ...offerProducts].map((p, i) => (
                <div 
                  key={`${p.id}-${i}`} 
                  onClick={() => setView('catalog', null, p.id)}
                  className="w-[130px] md:w-[180px] flex-shrink-0 group bg-white dark:bg-slate-900/40 rounded-xl overflow-hidden border border-[#e0e0e0] dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {(p.isOffer || p.isDiscounted) && p.oldPrice && (
                      <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg">
                        {lang === 'ar' ? 'خصم' : 'OFF'} {Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4 space-y-1 flex-1 flex flex-col justify-between">
                    <h4 className="font-black text-[#1a2b4c] dark:text-white text-[9px] md:text-[12px] uppercase truncate">
                      {lang === 'ar' ? p.nameAr : p.name}
                    </h4>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[#c4a76d] font-black text-[10px] md:text-[14px]">{p.price} SAR</span>
                      {p.oldPrice && (
                        <span className="text-slate-400 line-through text-[7px] md:text-[10px] font-bold opacity-60">{p.oldPrice} SAR</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-[#f9f7f2] dark:bg-slate-900/20 rounded-2xl md:rounded-[2.5rem] p-8 md:p-16 border border-[#e0e0e0] dark:border-white/5 py-10 md:py-20">
        <div className="text-center mb-8 md:mb-12 space-y-1.5 md:space-y-3">
          <h2 className="text-base md:text-3xl font-black text-[#1a2b4c] dark:text-white uppercase tracking-tighter">
            {t('howServiceWorks')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 relative">
          <div className="hidden lg:block absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#1a2b4c]/10 to-transparent -translate-y-1/2"></div>
          
          {[
            { step: 1, title: t('step1Title'), desc: t('step1Desc'), icon: <LinkIcon size={24} />, color: '#1a2b4c' },
            { step: 2, title: t('step2Title'), desc: t('step2Desc'), icon: <Calculator size={24} />, color: '#c4a76d' },
            { step: 3, title: t('step3Title'), desc: t('step3Desc'), icon: <Wallet size={24} />, color: '#1a2b4c' },
            { step: 4, title: t('step4Title'), desc: t('step4Desc'), icon: <Truck size={24} />, color: '#c4a76d' }
          ].map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center space-y-3 md:space-y-5 group">
              <div className={`w-14 h-14 md:w-24 md:h-24 bg-white dark:bg-slate-900 rounded-full border-2 md:border-[3px] border-[#e0e0e0] dark:border-white/5 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform relative z-10`} style={{ color: s.color }}>
                {s.icon}
                <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-5 h-5 md:w-7 md:h-7 bg-[#1a2b4c] text-white rounded-full flex items-center justify-center text-[9px] md:text-[11px] font-black ring-2 md:ring-[3px] ring-white dark:ring-slate-900">
                  {s.step}
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm md:text-lg font-black text-[#1a2b4c] dark:text-white uppercase tracking-tight">{s.title}</h3>
                <p className="text-[9px] md:text-[11px] text-[#7a7a7a] dark:text-white font-bold leading-relaxed uppercase tracking-wide">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="space-y-4 md:space-y-8 py-10 md:py-20">
        <div className="text-center md:text-right space-y-1.5">
          <h2 className="text-lg md:text-2xl font-black text-[#1a2b4c] dark:text-white tracking-tighter uppercase">
            {t('whyOrderWithUs')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 px-2 sm:px-0">
          {[
            { title: t('localPaymentOnDelivery'), icon: <Banknote size={24} /> },
            { title: t('fullTracking'), icon: <MapPin size={24} /> },
            { title: t('directWhatsappSupport'), icon: <MessageCircle size={24} /> },
            { title: t('fastCustomerService'), icon: <Headphones size={24} /> },
            { title: t('easyReturn'), icon: <RotateCcw size={24} /> }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col items-center text-center gap-2.5 p-4 md:p-5 bg-white dark:bg-slate-900 rounded-xl border border-[#e0e0e0] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 w-full min-h-[100px] md:min-h-[140px] justify-center mx-auto ${i === 4 ? 'col-span-2 md:col-span-1 md:col-start-2 lg:col-start-auto' : ''}`}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1a2b4c]/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-[#1a2b4c] dark:text-[#c4a76d] shadow-inner">
                {item.icon}
              </div>
              <span className="text-[11px] md:text-[14px] font-black text-[#1a2b4c] dark:text-white leading-tight px-2">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main CTA Section */}
      <section className="relative overflow-hidden bg-[#1a2b4c] text-white p-8 md:p-16 lg:p-20 rounded-2xl md:rounded-[3rem] shadow-2xl border-b-4 md:border-b-[6px] border-[#c4a76d]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-3 md:space-y-5">
          <h2 className="text-base md:text-2xl font-black uppercase tracking-tighter leading-tight">
            {t('shopAnywhere')}
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => {
                const el = document.getElementById('global-stores');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-fit mx-auto bg-white dark:bg-slate-800 text-[#1a2b4c] dark:text-white px-6 md:px-12 py-2.5 md:py-4 rounded-lg md:rounded-2xl font-black text-xs md:text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-4"
            >
              {t('startShoppingNow')}
              {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="bg-white dark:bg-slate-900/40 rounded-3xl md:rounded-[3rem] p-8 md:p-20 border border-[#e0e0e0] dark:border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4a76d] opacity-[0.03] rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-5xl font-black text-[#1a2b4c] dark:text-white tracking-tighter uppercase">
                {t('aboutUs')}
              </h2>
            </div>
            <p className="text-[#7a7a7a] dark:text-slate-300 text-base md:text-2xl font-bold leading-relaxed">
              {lang === 'ar' ? (customAboutUs.ar || t('aboutUsDesc')) : (customAboutUs.en || t('aboutUsDesc'))}
            </p>
            <div className="flex gap-4">
              <div className="bg-[#1a2b4c]/5 dark:bg-white/5 p-4 rounded-2xl border border-[#1a2b4c]/10 dark:border-white/10">
                <span className="block text-2xl md:text-4xl font-black text-[#1a2b4c] dark:text-white">10k+</span>
                <span className="text-[10px] md:text-xs font-black uppercase text-[#7a7a7a] dark:text-slate-400">{t('happyCustomers')}</span>
              </div>
              <div className="bg-[#1a2b4c]/5 dark:bg-white/5 p-4 rounded-2xl border border-[#1a2b4c]/10 dark:border-white/10">
                <span className="block text-2xl md:text-4xl font-black text-[#1a2b4c] dark:text-white">50k+</span>
                <span className="text-[10px] md:text-xs font-black uppercase text-[#7a7a7a] dark:text-slate-400">{t('completedOrders')}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-8">
              <img src={APP_LOGO} className="w-32 h-32 md:w-48 md:h-48 object-contain" alt="About Us" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#1a2b4c] text-white p-6 rounded-2xl shadow-xl hidden md:block">
              <Quote size={24} className="text-[#c4a76d] mb-2" />
              <p className="font-bold italic">"Bridging the gap between global markets and Yemen."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stores Grid */}
      <section id="global-stores" className="space-y-6 md:space-y-10 py-10 md:py-20">
        <div className="text-center space-y-2 md:space-y-4">
          <h2 className="text-lg md:text-3xl font-black text-[#1a2b4c] dark:text-white uppercase tracking-tighter">
            {t('certifiedStores')}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
          {STORES.map(store => (
            <div 
              key={store.id}
              onClick={() => setView('store', store.id)}
              className="flex flex-col items-center text-center cursor-pointer group transition-all"
            >
              <div className="w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-6 overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-white flex items-center justify-center p-4 md:p-8 group-hover:scale-110 shadow-[0_8px_30px_rgba(0,0,0,0.1)] group-hover:shadow-2xl transition-all duration-500 border border-[#e0e0e0]">
                 <img src={store.logo} alt={store.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-black text-[#7a7a7a] dark:text-slate-400 group-hover:text-[#1a2b4c] dark:group-hover:text-[#c4a76d] text-[8px] md:text-[11px] uppercase tracking-widest leading-tight transition-colors">
                {lang === 'en' ? store.name : store.nameAr}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
