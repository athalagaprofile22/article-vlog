// components/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Globe, Bell, Shield, ChevronDown, CheckCheck, Video, FileText, Sparkles, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NotificationItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  created_at: string;
}

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

  // Notifications State
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Welcome Popup / Toast State for the Latest Post
  const [latestPostPopup, setLatestPostPopup] = useState<NotificationItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'SI', label: 'සිංහල' },
    { code: 'TA', label: 'தமிழ்' },
  ];

  // අලුත්ම posts Supabase එකෙන් ලබා ගැනීම සහ Welcome Popup පෙන්වීම
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

          // අවසානෙට දාපු අලුත්ම Post එක තෝරා ගැනීම
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

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
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

  // Welcome Popup එක Close / Dismiss කිරීම
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

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-50 sm:bg-transparent px-2 py-1.5 rounded-lg sm:rounded-none transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="hidden md:inline">EN / සිං / த</span>
                <span className="inline md:hidden font-bold">{selectedLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer ${
                        selectedLang === lang.code
                          ? 'text-emerald-700 bg-emerald-50/50'
                          : 'text-slate-700'
                      }`}
                    >
                      {lang.label}
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

              {/* Notification Menu Box */}
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

                          {/* Clear Button (X) */}
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

      {/* ==============================================================
          WELCOME / RECENT POST POPUP TOAST (Mobile Balanced & English)
      ============================================================== */}
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

            {/* Close / Dismiss Button (X) */}
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