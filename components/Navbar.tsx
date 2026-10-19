// components/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Globe, Bell, Shield, Check, CheckCheck, Video, FileText, Sparkles, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NotificationItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  created_at: string;
}

const languages = [
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'si', label: 'සිංහල', short: 'සිං', flag: '🇱🇰' },
  { code: 'ta', label: 'தமிழ்', short: 'த', flag: '🇱🇰' },
];

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Welcome Popup / Toast State for the Latest Post
  const [latestPostPopup, setLatestPostPopup] = useState<NotificationItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Cookie එකෙන් දැනට සක්‍රිය භාෂාව හඳුනාගැනීම
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const googtrans = cookies.find((c) => c.trim().startsWith('googtrans='));
    if (googtrans) {
      const lang = googtrans.split('/').pop()?.trim().toLowerCase();
      if (lang && ['en', 'si', 'ta'].includes(lang)) {
        setCurrentLang(lang);
      }
    }
  }, []);

  // Google Translate භාෂාව මාරු කිරීමේ ක්‍රමවේදය
  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setLangOpen(false);

    // 1. Google Translate Cookies set කිරීම (Localhost සහ Production Domain දෙකටම අනුකූලව)
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    if (hostname !== 'localhost') {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${hostname};`;
    }

    // 2. Google Translate internal combo box එක trigger කිරීම
    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      window.location.reload();
    }
  };

  // Supabase වෙතින් අලුත්ම posts සහ Notifications ලබා ගැනීම
  useEffect(() => {
    async function loadNotifications() {
      try {
        const { data } = await supabase
          .from('posts')
          .select('id, title, slug, type, created_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (data && data.length > 0) {
          const clearedIds: string[] = JSON.parse(
            localStorage.getItem('athalaga_cleared_notifications') || '[]'
          );
          const activeNotifications = data.filter((item) => !clearedIds.includes(item.id));
          const finalNotifications = activeNotifications.length > 0 ? activeNotifications : data;

          setNotifications(finalNotifications);

          const readIds: string[] = JSON.parse(
            localStorage.getItem('athalaga_read_notifications') || '[]'
          );
          const unread = finalNotifications.filter((item) => !readIds.includes(item.id)).length;
          setUnreadCount(unread);

          const latestItem = finalNotifications[0];
          if (latestItem) {
            const dismissedPopupIds: string[] = JSON.parse(
              localStorage.getItem('athalaga_dismissed_popups') || '[]'
            );
            if (!dismissedPopupIds.includes(latestItem.id)) {
              setLatestPostPopup(latestItem);
              setTimeout(() => {
                setShowPopup(true);
              }, 600);
            }
          }
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    }

    loadNotifications();
  }, []);

  // Dropdowns වලින් පිටත ක්ලික් කළ විට වැසී යාම
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string) => {
    try {
      const readIds: string[] = JSON.parse(
        localStorage.getItem('athalaga_read_notifications') || '[]'
      );
      if (!readIds.includes(id)) {
        const updated = [...readIds, id];
        localStorage.setItem('athalaga_read_notifications', JSON.stringify(updated));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    }
    setNotifOpen(false);
  };

  const handleDismissPopup = () => {
    setShowPopup(false);
    if (latestPostPopup) {
      try {
        const dismissedPopupIds: string[] = JSON.parse(
          localStorage.getItem('athalaga_dismissed_popups') || '[]'
        );
        if (!dismissedPopupIds.includes(latestPostPopup.id)) {
          localStorage.setItem(
            'athalaga_dismissed_popups',
            JSON.stringify([...dismissedPopupIds, latestPostPopup.id])
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearSingleNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const clearedIds: string[] = JSON.parse(
        localStorage.getItem('athalaga_cleared_notifications') || '[]'
      );
      if (!clearedIds.includes(id)) {
        const updatedCleared = [...clearedIds, id];
        localStorage.setItem('athalaga_cleared_notifications', JSON.stringify(updatedCleared));
      }

      setNotifications((prev) => prev.filter((item) => item.id !== id));
      
      const readIds: string[] = JSON.parse(
        localStorage.getItem('athalaga_read_notifications') || '[]'
      );
      if (!readIds.includes(id)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem('athalaga_read_notifications', JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <img
              src="/image/logo.png"
              alt="Athalaga.lk Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover group-hover:scale-105 transition-transform"
            />
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
              Articles<span className="text-emerald-700">!</span>
            </span>
          </Link>

          {/* Right Actions Container */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Real Google Translate Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/60 transition active:scale-95 cursor-pointer"
                title="Change Language"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-sm shrink-0">{activeLangObj.flag}</span>
                <span className="hidden sm:inline">{activeLangObj.label}</span>
                <span className="inline sm:hidden uppercase font-extrabold">{activeLangObj.short}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition cursor-pointer text-left ${
                        currentLang === lang.code
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                      {currentLang === lang.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-full mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className="relative flex items-start gap-3 p-3.5 hover:bg-slate-50 transition group"
                        >
                          <Link
                            href={`/posts/${item.slug}`}
                            onClick={() => handleNotificationClick(item.id)}
                            className="flex items-start gap-3 flex-1 min-w-0"
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                item.type === 'vlog'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {item.type === 'vlog' ? (
                                <Video className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-5">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                New {item.type === 'vlog' ? 'Video Vlog' : 'Article'} published •{' '}
                                {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => handleClearSingleNotification(e, item.id)}
                            className="absolute right-2.5 top-3 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Clear notification"
                            aria-label="Clear notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Dashboard Link */}
            <Link
              href="/create"
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition shadow-xs active:scale-95 shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Welcome / Recent Post Popup Toast */}
      {latestPostPopup && (
        <div
          className={`fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-5 z-50 max-w-xs sm:max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 sm:p-4 transition-all duration-500 transform ${
            showPopup ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                latestPostPopup.type === 'vlog'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {latestPostPopup.type === 'vlog' ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Latest {latestPostPopup.type === 'vlog' ? 'Video Vlog' : 'Article'}
                </span>
              </div>
              <Link
                href={`/posts/${latestPostPopup.slug}`}
                onClick={handleDismissPopup}
                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-2 leading-snug"
              >
                {latestPostPopup.title}
              </Link>
              <div className="mt-2 flex items-center gap-2">
                <Link
                  href={`/posts/${latestPostPopup.slug}`}
                  onClick={handleDismissPopup}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition"
                >
                  <span>View Now</span>
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissPopup}
              className="absolute right-2 top-2 sm:right-3 sm:top-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close popup"
              aria-label="Close popup"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}