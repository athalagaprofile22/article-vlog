// components/NewsletterPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, X, CheckCircle2, Sparkles, Send, Loader2, Bell } from 'lucide-react';

export default function NewsletterPopup() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Admin Panel එකේදී (උදා: /create හෝ /admin) සම්පූර්ණයෙන්ම සඟවයි
  const isAdminPage = pathname?.includes('/create') || pathname?.includes('/admin');

  useEffect(() => {
    setMounted(true);
    if (isAdminPage) return;

    const hasSubscribed = localStorage.getItem('athalaga_subscribed');
    const hasClosed = sessionStorage.getItem('athalaga_popup_closed');

    if (!hasSubscribed && !hasClosed) {
      const timer = setTimeout(() => {
        openPopup();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAdminPage]);

  const openPopup = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('athalaga_popup_closed', 'true');
    setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('This email address is already subscribed!');
        } else {
          throw error;
        }
        setStatus('error');
      } else {
        setStatus('success');
        localStorage.setItem('athalaga_subscribed', 'true');
        setTimeout(() => {
          handleClose();
        }, 2200);
      }
    } catch (err: any) {
      console.error('Newsletter error:', err);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  if (!mounted || isAdminPage) return null;

  return (
    <>
      {/* FLOATING TRIGGER BUTTON: Mobile එකේදී කුඩා Icon එකක් පමණක් වන අතර Desktop එකේදී "Subscribe" අකුරු සමඟ පෙන්වයි */}
      {!isOpen && (
        <button
          type="button"
          onClick={openPopup}
          className="fixed bottom-4 left-4 z-[90] flex items-center justify-center p-3 sm:px-4 sm:py-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150 cursor-pointer group"
          title="Subscribe to Newsletter"
        >
          <span className="relative flex h-2 w-2 sm:mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Bell className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline text-xs font-bold ml-1.5">Subscribe</span>
        </button>
      )}

      {/* SOLID MODAL OVERLAY */}
      {isOpen && (
        <div
          onClick={handleClose}
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 transition-opacity duration-200 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* SOLID CARD DIALOG */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
              isVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close popup"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {status === 'success' ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
                  You&apos;re Subscribed!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Thank you for joining. You will receive notifications when new articles and vlogs are released.
                </p>
              </div>
            ) : (
              <div>
                {/* Header Icon & Tag */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md">
                      Athalaga.lk Insider
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                  Never Miss a Story or Vlog
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 mb-5 leading-relaxed">
                  Get instant alerts delivered directly to your email whenever we publish fresh updates.
                </p>

                {/* Form */}
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 p-2.5 rounded-lg">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-colors"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe Now</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
                  <span>🔒 100% Privacy. No spam.</span>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="hover:underline cursor-pointer"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}