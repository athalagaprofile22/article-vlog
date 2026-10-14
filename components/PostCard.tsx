// components/PostCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Video,
  FileText,
  Calendar,
  ArrowUpRight,
  Clock,
  Play,
  CheckCircle2
} from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    type: 'article' | 'vlog' | string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    tags?: string[];
    createdAt?: string;
    author?: {
      name: string;
      avatar: string;
    };
  };
}

function getReadingTime(text?: string): string {
  if (!text) return '2 min read';
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
}

export default function PostCard({ post }: PostCardProps) {
  const isVlog = post.type === 'vlog';
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex flex-col bg-white rounded-[2rem] p-2.5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-transform duration-200 ease-out hover:-translate-y-1 transform-gpu will-change-transform"
    >
      {/* 1. FRAMED MEDIA CONTAINER */}
      <div className="relative aspect-[16/10] w-full rounded-[1.5rem] overflow-hidden bg-slate-900 border border-slate-100">
        <img
          src={
            post.thumbnail ||
            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'
          }
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 transform-gpu will-change-transform"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

        {/* Top Left: Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
              isVlog ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isVlog ? (
              <>
                <Video className="w-3 h-3" />
                <span>Vlog</span>
              </>
            ) : (
              <>
                <FileText className="w-3 h-3" />
                <span>Article</span>
              </>
            )}
          </span>
        </div>

        {/* Center Play Icon (If Vlog) */}
        {isVlog && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 transform-gpu">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Bottom Info inside Image Frame */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white">
          <span className="inline-flex items-center gap-1 bg-slate-950/75 px-2.5 py-0.5 rounded-full">
            <Calendar className="w-3 h-3 text-emerald-400" />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-950/75 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-emerald-400" />
            {isVlog ? 'HD Video' : getReadingTime(post.content || post.excerpt)}
          </span>
        </div>
      </div>

      {/* 2. CARD BODY CONTENT */}
      <div className="flex flex-col flex-1 px-3 pt-4 pb-2">
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-base sm:text-[17px] font-black text-slate-900 group-hover:text-emerald-700 transition-colors duration-150 leading-snug line-clamp-2">
          {post.title}
        </h3>

        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-1">
          {post.excerpt ||
            (post.content
              ? post.content.slice(0, 110) + '...'
              : 'Click to read the full story on Athalaga.lk.')}
        </p>

        {/* 3. CARD FOOTER */}
        <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={post.author?.avatar || '/image/logo.png'}
              alt={post.author?.name || 'Athalaga.lk'}
              loading="lazy"
              decoding="async"
              className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <span className="text-xs font-bold text-slate-700 truncate">
              {post.author?.name || 'Athalaga.lk'}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 group-hover:text-white bg-emerald-50 group-hover:bg-emerald-700 px-3.5 py-1.5 rounded-full transition-colors duration-150">
            <span>{isVlog ? 'Watch' : 'Read'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}