// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Link from "next/link"; // <-- Link එක import කර ඇත
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Globe, MessageSquare } from 'lucide-react'; // <-- MessageSquare අයිකනය එකතු කර ඇත

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vlog & Article Hub | මගේ බ්ලොග් සහ වීලොග් අඩවිය",
  description: "ලිපි සහ සංචාරක/තාක්ෂණික Vlog එකම තැනකින් නැරඹීමට සහ කියවීමට ඇති අඩවිය.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          .goog-te-banner-frame,
          .goog-te-banner-frame.skiptranslate,
          iframe.skiptranslate {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
          }
          body {
            top: 0px !important;
            position: static !important;
          }
        `}</style>
      </head>
      <body
        className={`${inter.className} bg-[#f4f7f6] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200`}
        suppressHydrationWarning
      >
        <div id="google_translate_element" style={{ display: "none" }} />

        <Script id="google-translate-init" strategy="beforeInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,si,ta',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <Navbar />
        {children}

        {/* Footer with Social Media, Website & Contact Links */}
        <footer translate="no" className="notranslate mt-20 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
          <div className="max-w-6xl mx-auto px-4">
            {/* Social Media & Website Icons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Website */}
              <a
                href="https://athalaga.lk" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition shadow-xs"
                aria-label="Website"
                title="Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/your-page-name" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition shadow-xs"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@your-profile" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition shadow-xs"
                aria-label="TikTok"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/your-phone-number" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition shadow-xs"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-2.977-1.49-4.933-2.668-6.892-6.046-.149-.257-.016-.396.13-.541.133-.133.297-.347.446-.521.15-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>

            {/* Contact Support Link Button */}
            <div className="mb-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact & Support Desk</span>
              </Link>
            </div>

            <p className="font-medium text-gray-700 dark:text-gray-200">© 2026 Athalaga.lk Media Hub. All rights reserved.</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Powered by Athalaga.lk Media Hub </p>
          </div>
        </footer>
      </body>
    </html>
  );
}