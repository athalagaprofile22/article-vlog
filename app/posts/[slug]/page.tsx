// app/posts/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { initialPosts } from '@/data/posts';
import PostInteractions from '@/components/PostInteractions';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  FileText,
  Tag,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Loader2,
  BookOpen,
  ExternalLink,
  Globe,
  Facebook,
  Youtube,
  Instagram,
  MessageCircle,
  Send,
  Linkedin,
  Play,
  Printer
} from 'lucide-react';

// Google Drive සහ YouTube ලින්ක් Embed URL බවට හරවන Helper Function එක
function getVideoEmbedUrl(url: string): string {
  if (!url) return '';

  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&playsinline=1`;
  }

  return url;
}

function calculateReadingTime(text: string): number {
  if (!text) return 2;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}

function SmartLinkBadge({ url, customLabel }: { url: string; customLabel?: string }) {
  const lower = url.toLowerCase();

  let label = customLabel || url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
  let IconComponent: any = Globe;

  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
    label = customLabel || 'Facebook';
    badgeClass = 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    IconComponent = Facebook;
  } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    label = customLabel || 'YouTube';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    IconComponent = Youtube;
  } else if (lower.includes('instagram.com')) {
    label = customLabel || 'Instagram';
    badgeClass = 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100';
    IconComponent = Instagram;
  } else if (lower.includes('wa.me') || lower.includes('whatsapp.com')) {
    label = customLabel || 'WhatsApp';
    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    IconComponent = MessageCircle;
  } else if (lower.includes('tiktok.com')) {
    label = customLabel || 'TikTok';
    badgeClass = 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800';
    IconComponent = Video;
  } else if (lower.includes('t.me') || lower.includes('telegram.me')) {
    label = customLabel || 'Telegram';
    badgeClass = 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
    IconComponent = Send;
  } else if (lower.includes('linkedin.com')) {
    label = customLabel || 'LinkedIn';
    badgeClass = 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
    IconComponent = Linkedin;
  } else if (lower.includes('twitter.com') || lower.includes('x.com')) {
    label = customLabel || 'X (Twitter)';
    badgeClass = 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200';
    IconComponent = Globe;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1 mx-1 my-0.5 rounded-full text-xs font-bold border transition shadow-2xs align-middle hover:scale-[1.02] active:scale-95 ${badgeClass}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate max-w-[220px]">{label}</span>
      <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
    </a>
  );
}

function renderInlineContent(text: string) {
  const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (mdLinkMatch) {
      return <SmartLinkBadge key={index} customLabel={mdLinkMatch[1]} url={mdLinkMatch[2]} />;
    }

    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {boldMatch[1]}
        </strong>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return <SmartLinkBadge key={index} url={part} />;
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function RichPostContent({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-slate-400 italic text-sm">
        මෙම ලිපියේ වැඩිදුර විස්තර ළඟදීම යාවත්කාලීන කෙරේ.
      </p>
    );
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${keyPrefix}`}
          className="space-y-2.5 my-4 pl-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-100"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <div className="flex-1">{renderInlineContent(item)}</div>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList(idx);
      return;
    }

    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      listItems.push(line.replace(/^[-*•]\s+/, ''));
      return;
    }

    flushList(idx);

    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={idx}
          className="text-base sm:text-lg font-extrabold text-slate-900 mt-7 mb-2 flex items-center gap-2"
        >
          <span className="w-1.5 h-5 rounded-full bg-emerald-600 inline-block" />
          <span>{renderInlineContent(line.replace(/^###\s+/, ''))}</span>
        </h3>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={idx}
          className="text-lg sm:text-xl font-black text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-100"
        >
          {renderInlineContent(line.replace(/^##\s+/, ''))}
        </h2>
      );
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h2
          key={idx}
          className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3 pb-2 border-b border-emerald-100"
        >
          {renderInlineContent(line.replace(/^#\s+/, ''))}
        </h2>
      );
      return;
    }

    elements.push(
      <p key={idx} className="text-slate-700 text-sm sm:text-base leading-[1.85] my-3.5">
        {renderInlineContent(line)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="space-y-2">{elements}</div>;
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileVideoPlay, setMobileVideoPlay] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY;
      setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchPostData() {
      if (!slug) return;
      setLoading(true);
      setMobileVideoPlay(false);

      try {
        const { data: dbPost } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        let currentPost: any = null;

        if (dbPost) {
          // ස්වයංක්‍රීයව Database එකේ views අගය +1 කින් වැඩි කිරීම (Increment Views)
          const currentViews = Number(dbPost.views) || Number(dbPost.view_count) || 0;
          await supabase
            .from('posts')
            .update({ views: currentViews + 1 })
            .eq('id', dbPost.id);

          currentPost = {
            id: dbPost.id,
            title: dbPost.title,
            slug: dbPost.slug,
            type: dbPost.type || 'article',
            excerpt: dbPost.excerpt || '',
            content: dbPost.content || '',
            thumbnail:
              dbPost.thumbnail_url ||
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
            tags: dbPost.tags || [],
            videoUrl: dbPost.video_url || '',
            createdAt: dbPost.published_at || dbPost.created_at,
            likes_count: dbPost.likes_count || 0,
            unlikes_count: dbPost.unlikes_count || 0,
            author: {
              name: 'Athalaga.lk Editorial',
              role: 'Verified Media Hub',
              avatar: '/image/logo.png',
            },
          };
        } else {
          const localMatch = (initialPosts || []).find((p: any) => p.slug === slug);
          if (localMatch) {
            currentPost = {
              ...localMatch,
              author: {
                name: localMatch.author?.name || 'Athalaga.lk Editorial',
                role: 'Verified Media Hub',
                avatar: '/image/logo.png',
              },
            };
          }
        }

        setPost(currentPost);

        const nowIso = new Date().toISOString();
        const { data: recentDb } = await supabase
          .from('posts')
          .select('*')
          .eq('is_published', true)
          .neq('slug', slug)
          .or(`published_at.lte.${nowIso},published_at.is.null`)
          .order('created_at', { ascending: false })
          .limit(4);

        const formattedRecent = (recentDb || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          type: item.type,
          thumbnail:
            item.thumbnail_url ||
            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
          createdAt: item.published_at || item.created_at,
        }));

        const fallbackRelated = (initialPosts || [])
          .filter((p: any) => p.slug !== slug)
          .slice(0, 4);

        setRelatedPosts([...formattedRecent, ...fallbackRelated].slice(0, 4));
      } catch (err) {
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPostData();
  }, [slug]);

  // ==============================================================
  // PREMIUM LOADING ANIMATION (Article Click Loading Screen)
  // ==============================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/90 shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
            <Loader2 className="w-7 h-7 text-emerald-700 animate-pulse" />
          </div>

          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Loading Story...
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
            ලිපිය සූදානම් කරමින් පවතී, කරුණාකර මොහොතක් රැඳී සිටින්න.
          </p>

          <div className="mt-7 space-y-2.5">
            <div className="w-full h-3 bg-slate-100 rounded-full animate-pulse" />
            <div className="w-4/5 h-3 bg-slate-100 rounded-full animate-pulse mx-auto" />
            <div className="w-3/5 h-3 bg-slate-100 rounded-full animate-pulse mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Post Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
          ඔබ සොයන ලිපිය හෝ වීඩියෝව ඉවත් කර හෝ වෙනස් කර තිබිය හැක.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          මුල් පිටුවට යන්න
        </Link>
      </div>
    );
  }

  const readingMinutes = calculateReadingTime(post.content || post.excerpt);
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-20">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-medium truncate max-w-md">
            <Link href="/" className="hover:text-emerald-700">
              Athalaga.lk
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="capitalize">{post.type}s</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-slate-700 font-semibold truncate">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT / MAIN ARTICLE COLUMN */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-visible relative z-10">
            
            {/* MOBILE ONLY: EMBEDDED VIDEO PLAYER */}
            <div className="block sm:hidden p-2.5 pb-0">
              {post.type === 'vlog' && post.videoUrl ? (
                <div className="relative w-full aspect-video rounded-[1.35rem] bg-black overflow-hidden shadow-md border border-slate-200">
                  {mobileVideoPlay ? (
                    <iframe
                      src={getVideoEmbedUrl(post.videoUrl)}
                      title={post.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMobileVideoPlay(true)}
                      className="relative w-full h-full block text-left group cursor-pointer focus:outline-none"
                    >
                      <img
                        src={
                          post.thumbnail ||
                          'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1000&q=80'
                        }
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/25" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                          <Video className="w-3 h-3" />
                          <span>Video Vlog</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black/55 border border-white/15 px-2.5 py-1 rounded-full">
                          HD 1080p
                        </span>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 active:scale-95 transition-transform">
                        <div className="w-13 h-13 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold shadow-lg">
                          <span>Play Video Now</span>
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              ) : post.thumbnail ? (
                <div className="relative w-full aspect-[16/10] rounded-[1.35rem] bg-slate-100 overflow-hidden border border-slate-100">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                      <FileText className="w-3 h-3" />
                      <span>Article</span>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* 1. Article Header Section */}
            <div className="p-5 sm:p-8 lg:p-10 pb-5 sm:pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      post.type === 'vlog'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {post.type === 'vlog' ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    {post.type === 'vlog' ? 'Video Vlog' : 'Featured Article'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formattedDate}
                  </span>

                  <span className="text-slate-300">•</span>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {post.type === 'vlog' ? 'Video Release' : `${readingMinutes} min read`}
                  </span>
                </div>

                {/* Print / PDF Download Button */}
                <div className="no-print">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition cursor-pointer shadow-2xs"
                    title="Print or Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Post Title */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.22]">
                {post.title}
              </h1>

              {/* Author Strip */}
              <div className="flex items-center justify-between flex-wrap gap-4 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={post.author?.avatar || '/image/logo.png'}
                      alt={post.author?.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-emerald-200 shadow-xs"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {post.author?.name || 'Athalaga.lk'}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Official Media & Community Story
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Content</span>
                </div>
              </div>
            </div>

            {/* DESKTOP ONLY: FEATURED MEDIA SHOWCASE */}
            <div className="hidden sm:block px-8 lg:px-10 pt-6">
              {post.type === 'vlog' && post.videoUrl ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950">
                  <iframe
                    src={getVideoEmbedUrl(post.videoUrl)}
                    title={post.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : post.thumbnail ? (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-100">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            {/* 3. Article Body, Excerpt & Smart Links */}
            <div className="p-5 sm:p-8 lg:p-10">
              {post.excerpt && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-l-4 border-emerald-600 text-slate-700 text-sm sm:text-base font-medium leading-relaxed mb-6 sm:mb-8">
                  {renderInlineContent(post.excerpt)}
                </div>
              )}

              <RichPostContent content={post.content} />

              {/* Tags Section */}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 mt-8 sm:mt-10 pt-6 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 mr-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Tags:
                  </span>
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 4. Interactive Like, Unlike & Social Share Component */}
              <div className="mt-6 no-print">
                <PostInteractions
                  postId={post.id}
                  postTitle={post.title}
                  initialLikes={post.likes_count || 0}
                  initialUnlikes={post.unlikes_count || 0}
                />
              </div>
            </div>
          </article>

          {/* RIGHT SIDEBAR COLUMN */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 no-print">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>තවත් ජනප්‍රිය නිර්මාණ</span>
                </h3>
              </div>

              {relatedPosts.length > 0 ? (
                <div className="space-y-4">
                  {relatedPosts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/posts/${item.slug}`}
                      className="flex items-start gap-3.5 group p-2 -mx-2 rounded-2xl hover:bg-slate-50 transition"
                    >
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            item.type === 'vlog'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 mt-1 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  වෙනත් ලිපි කිසිවක් නොමැත.
                </p>
              )}

              <Link
                href="/"
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>සියලුම ලිපි සහ වීඩියෝ බලන්න</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-1 rounded-full mb-3">
                  Athalaga.lk Network
                </span>
                <h3 className="text-lg font-black leading-snug">
                  ඔබට අවශ්‍ය දක්ෂ ශිල්පීන් සහ සේවාවන් එකම තැනකින්!
                </h3>
                <p className="text-xs text-emerald-100/75 mt-2 leading-relaxed">
                  ශ්‍රී ලංකාව පුරා විසිරී සිටින විශ්වාසවන්ත වෘත්තිකයන් සහ සේවා සපයන්නන් සමඟ පහසුවෙන් සම්බන්ධ වන්න.
                </p>
                <Link
                  href="/"
                  className="mt-5 inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md"
                >
                  <span>Explore Athalaga.lk</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}