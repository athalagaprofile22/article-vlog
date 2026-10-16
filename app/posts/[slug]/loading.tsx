// app/posts/[slug]/loading.tsx
import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Subtle Loading Progress Bar */}
      <div className="fixed top-0 inset-x-0 h-1 bg-slate-200/50 dark:bg-slate-800 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-[loading-bar_1.5s_infinite_linear] origin-left w-full" />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Back Button Skeleton */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 animate-pulse text-xs font-semibold mb-8 text-transparent select-none">
          <ArrowLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span>Back to Articles</span>
        </div>

        {/* Article Header Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Badge & Date Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-emerald-100/70 dark:bg-emerald-950/50 rounded-full animate-pulse" />
            <div className="h-4 w-32 bg-slate-200/80 dark:bg-slate-800 rounded-md animate-pulse" />
          </div>

          {/* Title Lines Skeleton */}
          <div className="space-y-3">
            <div className="h-8 sm:h-10 w-11/12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-8 sm:h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>

          {/* Excerpt Skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
          </div>

          {/* Featured Image / Video Skeleton with Pulse Shimmer */}
          <div className="relative w-full aspect-video sm:h-[420px] rounded-2xl bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 animate-pulse flex flex-col items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
              <Sparkles className="w-8 h-8 animate-spin duration-1000" />
              <span className="text-xs font-bold tracking-widest uppercase">Loading Story...</span>
            </div>
          </div>

          {/* Article Body Content Paragraphs Skeleton */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse" />
            <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse" />
            <div className="h-4 w-11/12 bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse" />
            
            <div className="pt-4 space-y-3">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse" />
              <div className="h-4 w-9/12 bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse" />
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}