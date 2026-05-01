
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { Star, MessageSquare, X } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  nameAr: string;
  comment: string;
  commentAr: string;
  rating: number;
}

const REVIEWS_DATA: Review[] = [
  {
    id: 1,
    name: "Ahmed Al-Saadi",
    nameAr: "أحمد السعدي",
    comment: "Excellent service and fast delivery. The products are high quality.",
    commentAr: "خدمة ممتازة وتوصيل سريع. المنتجات ذات جودة عالية.",
    rating: 5
  },
  {
    id: 2,
    name: "Sara Mohammed",
    nameAr: "سارة محمد",
    comment: "I love the variety of products. Highly recommended!",
    commentAr: "أحب تنوع المنتجات. أنصح به بشدة!",
    rating: 5
  },
  {
    id: 3,
    name: "Hassan Ali",
    nameAr: "حسن علي",
    comment: "The best store in Yemen for international products.",
    commentAr: "أفضل متجر في اليمن للمنتجات العالمية.",
    rating: 4
  },
  {
    id: 4,
    name: "Amal Saleh",
    nameAr: "أمل صالح",
    comment: "Great customer support and easy tracking system.",
    commentAr: "دعم عملاء رائع ونظام تتبع سهل.",
    rating: 5
  }
];

export const CustomerReviews: React.FC<{ lang: Language }> = ({ lang }) => {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  const [index, setIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 4000); // Slowed down to 4 seconds
    return () => clearInterval(timer);
  }, [reviews.length]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now();
    const review: Review = {
      id,
      name: newReview.name,
      nameAr: newReview.name,
      comment: newReview.comment,
      commentAr: newReview.comment,
      rating: newReview.rating
    };
    setReviews([review, ...reviews]);
    setShowForm(false);
    setNewReview({ name: '', comment: '', rating: 5 });
    setIndex(0);
  };

  const review = reviews[index];

  return (
    <div className="py-12 bg-[#f9f7f2] dark:bg-transparent overflow-hidden border-t border-[#e0e0e0] dark:border-white/5 transition-colors duration-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-lg md:text-2xl font-black text-[#1a2b4c] dark:text-white uppercase tracking-widest">
            {lang === 'ar' ? 'آراء العملاء' : 'Customer Reviews'}
          </h3>
          <div className="w-12 h-1 bg-[#c4a76d] mx-auto mt-2 rounded-full shadow-[0_0_10px_rgba(196,167,109,0.3)]"></div>
        </div>

        <div className="relative h-32 md:h-40 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute w-full max-w-2xl text-center px-4"
            >
              <div className="flex justify-center gap-1.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={`${i < review.rating ? 'text-[#c4a76d] fill-[#c4a76d]' : 'text-slate-300 dark:text-slate-800'}`} />
                ))}
              </div>
              <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-100 leading-relaxed italic">
                "{lang === 'ar' ? review.commentAr : review.comment}"
              </p>
              <h4 className="mt-4 text-[10px] md:text-[13px] font-black text-[#c4a76d] uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="w-4 h-[1px] bg-[#c4a76d]/30"></span>
                {lang === 'ar' ? review.nameAr : review.name}
                <span className="w-4 h-[1px] bg-[#c4a76d]/30"></span>
              </h4>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setShowForm(true)}
            className="bg-[#1a2b4c] dark:bg-[#c4a76d] text-white dark:text-[#1a2b4c] px-8 py-3 rounded-2xl font-black text-[10px] md:text-[13px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto border border-white/10 dark:border-white/20"
          >
            <MessageSquare size={14} />
            {lang === 'ar' ? 'شاركنا رأيك' : 'Share Your Review'}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md p-8 md:p-10 rounded-[3rem] shadow-2xl border border-[#c4a76d]/30 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-black text-[#1a2b4c] dark:text-white uppercase tracking-tighter">
                    {lang === 'ar' ? 'أضف تقييمك' : 'Add Your Review'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lang === 'ar' ? 'رأيك يهمنا دائماً' : 'Your feedback matters'}</p>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddReview} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{lang === 'ar' ? 'الاسم المستعار' : 'Your Name'}</label>
                  <input 
                    type="text" 
                    placeholder={lang === 'ar' ? 'ادخل اسمك هنا...' : 'Enter your name...'} 
                    required 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 p-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#c4a76d] transition-all"
                    value={newReview.name}
                    onChange={e => setNewReview({...newReview, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{lang === 'ar' ? 'رأيك بالخدمة' : 'Your Experience'}</label>
                  <textarea 
                    placeholder={lang === 'ar' ? 'اكتب تجربتك هنا باختصار...' : 'Describe your experience...'} 
                    required 
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 p-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#c4a76d] resize-none transition-all"
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  ></textarea>
                </div>
                <div className="flex flex-col gap-2 px-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{lang === 'ar' ? 'التقييم العام:' : 'Overall Rating:'}</span>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="transition-all hover:scale-110 active:scale-95 focus:outline-none"
                      >
                        <Star size={24} className={`${star <= newReview.rating ? 'text-[#c4a76d] fill-[#c4a76d]' : 'text-slate-200 dark:text-slate-800'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#1a2b4c] dark:bg-[#c4a76d] text-white dark:text-[#1a2b4c] py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#253b66] dark:hover:bg-[#d4b77d] transition-all text-xs active:scale-95">
                  {lang === 'ar' ? 'إرسال التقييم النهائي' : 'Post My Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
