// components/LanguageSwitcher.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', label: 'தமிழ்', flag: '🇱🇰' },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Google Translate Script එක Dynamic ලෙස load කිරීම
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,si,ta',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }

    // Cookie එකෙන් කලින් තෝරාගත් භාෂාව ලබා ගැනීම
    const cookies = document.cookie.split(';');
    const googtrans = cookies.find((c) => c.trim().startsWith('googtrans='));
    if (googtrans) {
      const lang = googtrans.split('/').pop();
      if (lang && ['en', 'si', 'ta'].includes(lang)) {
        setCurrentLang(lang);
      }
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Google Translate Cookie එක set කර page එක refresh කරවයි
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname};`;

    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const activeObj = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="relative inline-block text-left z-50">
      {/* Hidden original container */}
      <div id="google_translate_element" className="hidden" />

      {/* Styled Modern Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 border border-slate-200/80 hover:border-emerald-500 shadow-2xs hover:bg-slate-50 transition active:scale-95 text-slate-800"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-sm">{activeObj.flag}</span>
        <span>{activeObj.label}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Select Language
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {currentLang === lang.code && (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}