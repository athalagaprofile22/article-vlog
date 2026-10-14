// app/posts/[slug]/loading.tsx
import { Loader2 } from 'lucide-react';

export default function PostLoading() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/80 shadow-xl text-center max-w-sm w-full">
        {/* Animated Loading Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <Loader2 className="w-7 h-7 text-emerald-700 animate-pulse" />
        </div>

        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Loading Story...
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          잠시만 기다려주세요 / Please wait while we fetch the content for you.
        </p>

        {/* Decorative Skeleton Lines */}
        <div className="mt-6 space-y-2">
          <div className="w-full h-3 bg-slate-100 rounded-full animate-pulse" />
          <div className="w-4/5 h-3 bg-slate-100 rounded-full animate-pulse mx-auto" />
        </div>
      </div>
    </main>
  );
}