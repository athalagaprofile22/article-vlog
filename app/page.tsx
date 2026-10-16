// app/page.tsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { initialPosts } from '@/data/posts';
import PostCard from '@/components/PostCard';
import PostSkeleton from '@/components/PostSkeleton';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Sparkles,
  Video,
  BookOpen,
  Flame,
  MapPin,
  ShieldCheck,
  Clapperboard,
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Play,
  Mail,
  TrendingUp,
  Layers
} from 'lucide-react';

const slides = [
  {
    image: 'https://i.ibb.co/bMqf63rt/bg.png',
    title: 'Ella Nine Arch Bridge - Scenic Highland Journey',
    location: 'Ella, Sri Lanka',
    category: 'Travel Vlog',
    badgeColor: 'bg-rose-600'
  },
  {
    image: 'https://i.ibb.co/5V2QtYH/bg1.png',
    title: 'Modern Web & Digital Innovation Guide 2026',
    location: 'Colombo, Sri Lanka',
    category: 'Tech Article',
    badgeColor: 'bg-emerald-600'
  },
  {
    image: 'https://i.ibb.co/39vWy2Wz/bg3.jpg',
    title: 'Colombo Street Food Tour & Vibrant Nightlife',
    location: 'Galle Face, Colombo',
    category: 'Food Vlog',
    badgeColor: 'bg-amber-500'
  }
];

const quickTopics = ['All Topics', 'Travel', 'Tech', 'Food', 'Culture', 'Lifestyle', 'Services'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'vlog' | 'article'>('all');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [allPosts, setAllPosts] = useState<any[]>(initialPosts || []);
  const [postsLoading, setPostsLoading] = useState(true);

  // Fetch posts from Supabase Database
  useEffect(() => {
    async function loadDatabasePosts() {
      try {
        const nowIsoString = new Date().toISOString();

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('is_published', true)
          .or(`published_at.lte.${nowIsoString},published_at.is.null`)
          .order('published_at', { ascending: false, nullsFirst: false });

        if (!error && data && data.length > 0) {
          const formattedSupabasePosts = data.map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            type: item.type,
            excerpt: item.excerpt || '',
            content: item.content || '',
            thumbnail:
              item.thumbnail_url ||
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
            tags: item.tags || [],
            videoUrl: item.video_url || '',
            createdAt: item.published_at || item.created_at,
            author: {
              name: 'Athalaga.lk',
              avatar: '/image/logo.png'
            }
          }));

          setAllPosts([...formattedSupabasePosts, ...(initialPosts || [])]);
        }
      } catch (err) {
        console.error('Failed to fetch posts from Supabase:', err);
      } finally {
        setPostsLoading(false);
      }
    }

    loadDatabasePosts();
  }, []);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-slide transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase();

  // 100% Robust Filter Logic for Search & Categories
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesTab = activeTab === 'all' || post.type === activeTab;

      const matchesTopic =
        selectedTopic === 'All Topics' ||
        (Array.isArray(post.tags) &&
          post.tags.some((t: string) => t && t.toLowerCase() === selectedTopic.toLowerCase())) ||
        (post.title && post.title.toLowerCase().includes(selectedTopic.toLowerCase()));

      if (!cleanQuery) return matchesTab && matchesTopic;

      const titleMatch = post.title ? post.title.toLowerCase().includes(cleanQuery) : false;
      const excerptMatch = post.excerpt ? post.excerpt.toLowerCase().includes(cleanQuery) : false;
      const contentMatch = post.content ? post.content.toLowerCase().includes(cleanQuery) : false;
      const tagsMatch =
        Array.isArray(post.tags) && post.tags.some((t: string) => t && t.toLowerCase().includes(cleanQuery));

      return matchesTab && matchesTopic && (titleMatch || excerptMatch || contentMatch || tagsMatch);
    });
  }, [allPosts, activeTab, selectedTopic, cleanQuery]);

  // Robust Instant Search Results Logic
  const instantSearchResults = useMemo(() => {
    if (!cleanQuery) return [];
    return allPosts
      .filter((post) => {
        const titleMatch = post.title ? post.title.toLowerCase().includes(cleanQuery) : false;
        const excerptMatch = post.excerpt ? post.excerpt.toLowerCase().includes(cleanQuery) : false;
        const tagsMatch =
          Array.isArray(post.tags) && post.tags.some((t: string) => t && t.toLowerCase().includes(cleanQuery));
        return titleMatch || excerptMatch || tagsMatch;
      })
      .slice(0, 6);
  }, [allPosts, cleanQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedMobile = mobileSearchRef.current?.contains(target);
      const clickedDesktop = desktopSearchRef.current?.contains(target);

      if (!clickedMobile && !clickedDesktop) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setNewsletterStatus('error');
      return;
    }

    setNewsletterStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: 'YOUR_ACCESS_KEY_HERE',
          email: newsletterEmail,
          subject: 'New Newsletter Subscriber - Athalaga.lk',
          from_name: 'Athalaga.lk Newsletter'
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setErrorMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setNewsletterStatus('error');
      setErrorMessage('Network error occurred. Please try again later.');
    }
  };

  const isSearchOpen = isSearchFocused && cleanQuery.length > 0;

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-800 selection:bg-emerald-600 selection:text-white">
      {/* =========================================================
          1. HERO SECTION (APP-LIKE MOBILE + EDITORIAL DESKTOP)
      ========================================================= */}
      <section className="relative z-30 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 pb-4 lg:py-10">
        
        {/* MOBILE VIEW */}
        <div className="block lg:hidden space-y-4">
          <div className="bg-white rounded-[2rem] p-4 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Athalaga Media Hub
                </span>
                <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  Explore <span className="text-emerald-700">Stories & Vlogs</span>
                </h1>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <img src="/image/logo.png" alt="Athalaga" className="w-6 h-6 rounded-full object-cover" />
              </div>
            </div>

            {/* Mobile Search Pill */}
            <div ref={mobileSearchRef} className="relative z-50">
              <div className="bg-slate-100 rounded-2xl p-1.5 flex items-center border border-slate-200 focus-within:bg-white focus-within:border-emerald-600 transition-colors">
                <div className="pl-3 pr-2 text-emerald-600 shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search vlogs, articles, places..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  className="w-full py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-transparent outline-none font-semibold"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="p-1.5 bg-slate-200 rounded-xl text-slate-600 mr-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl shrink-0 mr-0.5">
                    LK
                  </span>
                )}
              </div>

              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
                  <div className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 flex justify-between items-center">
                    <span>Instant Results ({instantSearchResults.length})</span>
                    <span className="text-emerald-600">Live</span>
                  </div>
                  {instantSearchResults.length > 0 ? (
                    instantSearchResults.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 p-3 active:bg-emerald-50 transition bg-white"
                      >
                        <img src={post.thumbnail} alt={post.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${post.type === 'vlog' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                            {post.type}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{post.title}</h4>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-5 text-center text-xs text-slate-500 bg-white">
                      No matching stories for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Visual Slider */}
          {postsLoading ? (
            <div className="bg-white p-2 rounded-[2.25rem] border border-slate-200 shadow-xs">
              <div className="w-full aspect-[16/10] bg-slate-200 animate-pulse rounded-[1.75rem]" />
            </div>
          ) : (
            <div className="bg-white p-2 rounded-[2.25rem] border border-slate-200 shadow-xs">
              <div className="relative aspect-[16/10] w-full rounded-[1.75rem] overflow-hidden bg-slate-900">
                {slides.map((slide, index) => (
                  <div key={index} className={`absolute inset-0 transition-opacity duration-500 ease-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`${slide.badgeColor} text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                        {slide.category}
                      </span>
                      <span className="bg-slate-950/75 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {slide.location}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">{slide.title}</h2>
                      </div>
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Filter Dock */}
          <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button type="button" onClick={() => setActiveTab('all')} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${activeTab === 'all' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 active:bg-slate-100'}`}>
              <Flame className="w-3.5 h-3.5" /> <span>All Feed</span>
            </button>
            <button type="button" onClick={() => setActiveTab('vlog')} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${activeTab === 'vlog' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 active:bg-slate-100'}`}>
              <Video className="w-3.5 h-3.5" /> <span>Vlogs</span>
            </button>
            <button type="button" onClick={() => setActiveTab('article')} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${activeTab === 'article' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 active:bg-slate-100'}`}>
              <BookOpen className="w-3.5 h-3.5" /> <span>Articles</span>
            </button>
          </div>

          {/* Quick Topics */}
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            {quickTopics.map((topic) => (
              <button key={topic} type="button" onClick={() => setSelectedTopic(topic)} className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${selectedTopic === topic ? 'bg-slate-900 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'}`}>
                {topic === 'All Topics' ? '✨ All Topics' : `#${topic}`}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden lg:block bg-white rounded-[2.75rem] border border-slate-200 shadow-sm p-10 xl:p-12">
          <div className="grid grid-cols-12 gap-10 xl:gap-12 items-center">
            <div className="col-span-6 text-left">
              <div className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Athalaga.lk • Official Media & Stories</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.14]">
                Discover Inspiring <br />
                Stories & Vlogs in{' '}
                <span className="relative inline-block text-emerald-700">
                  Sri Lanka
                </span>
              </h1>

              <p className="mt-5 text-slate-600 text-sm xl:text-base leading-relaxed max-w-lg">
                Explore curated visual stories, travel vlogs, and insightful articles while connecting with trusted skilled professionals across the island.
              </p>

              {/* Desktop Search Bar */}
              <div ref={desktopSearchRef} className="relative mt-7 max-w-lg z-50">
                <div className="bg-slate-50 p-1.5 rounded-full flex items-center border border-slate-200 focus-within:bg-white focus-within:border-emerald-600 transition-colors">
                  <div className="flex items-center gap-1.5 pl-4 pr-3 py-1 text-xs font-bold text-emerald-900 border-r border-slate-200 shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Sri Lanka</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search vlogs, articles, or topics..."
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none font-medium"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 mr-1 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => setIsSearchFocused(true)} className="px-6 h-10 bg-emerald-700 hover:bg-emerald-800 rounded-full flex items-center justify-center gap-2 text-white text-xs font-bold shrink-0 transition cursor-pointer">
                    <Search className="w-4 h-4" /> <span>Explore</span>
                  </button>
                </div>

                {/* Desktop Search Dropdown */}
                {isSearchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2.5 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                    <div className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-emerald-950 bg-emerald-50 flex justify-between items-center">
                      <span>Matching Releases ({instantSearchResults.length})</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Live Search
                      </span>
                    </div>
                    {instantSearchResults.length > 0 ? (
                      instantSearchResults.map((post) => (
                        <Link
                          key={post.id}
                          href={`/posts/${post.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-4 p-3.5 hover:bg-emerald-50/50 transition group bg-white"
                        >
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-14 h-12 rounded-2xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                post.type === 'vlog'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {post.type}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate mt-1">
                              {post.title}
                            </h4>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-700 flex items-center justify-center text-slate-500 group-hover:text-white transition shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 bg-white">
                        No stories found matching "{searchQuery}".
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Hero Slider */}
            <div className="col-span-6">
              {postsLoading ? (
                <div className="bg-slate-100 p-3 rounded-[2.5rem] border border-slate-200">
                  <div className="w-full aspect-[16/10] bg-slate-200 animate-pulse rounded-[2rem]" />
                </div>
              ) : (
                <div className="bg-slate-100 p-3 rounded-[2.5rem] border border-slate-200">
                  <div className="relative aspect-[16/10] w-full rounded-[2rem] overflow-hidden bg-slate-900 shadow-md">
                    {slides.map((slide, index) => (
                      <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/85 border border-white/10 text-white flex items-center justify-between gap-4">
                          <div>
                            <span className={`inline-block ${slide.badgeColor} text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1`}>
                              {slide.category}
                            </span>
                            <h3 className="text-base xl:text-lg font-black leading-snug text-white">{slide.title}</h3>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. MAIN FEED SECTION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="hidden lg:block bg-white rounded-[2.25rem] border border-slate-200 shadow-xs p-7 mb-8">
          <div className="flex items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> <span>Curated Feed</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {cleanQuery ? 'Search Results' : 'Featured Releases'}
              </h2>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200">
              <button type="button" onClick={() => setActiveTab('all')} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTab === 'all' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'}`}>All</button>
              <button type="button" onClick={() => setActiveTab('vlog')} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTab === 'vlog' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'}`}>Vlogs</button>
              <button type="button" onClick={() => setActiveTab('article')} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTab === 'article' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'}`}>Articles</button>
            </div>
          </div>
        </div>

        {/* Post Cards Grid with Loading Skeletons */}
        {postsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200 p-6">
            <p className="text-sm font-black text-slate-800">No stories found matching your filter</p>
          </div>
        )}
      </section>

      {/* =========================================================
          3. MARKETPLACE SECTION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="bg-white p-2 sm:p-3 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200 shadow-xs">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-slate-950 text-white p-6 sm:p-12 lg:p-14">
            <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-bold text-[10px] sm:text-[11px] uppercase tracking-widest px-3.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> Athalaga Ecosystem
              </span>
              <h2 className="text-xl sm:text-4xl font-black text-white mt-3 tracking-tight">Everything You Need, In One Place</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-[1.75rem]">
                <h3 className="text-sm sm:text-lg font-extrabold text-white">Find Skilled Workers</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Discover reliable professionals for home repairs and services.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-[1.75rem]">
                <h3 className="text-sm sm:text-lg font-extrabold text-white">Verified Profiles</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Compare skills, service locations, and real experience.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-[1.75rem]">
                <h3 className="text-sm sm:text-lg font-extrabold text-white">Grow Opportunities</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Empowering local tradespeople and creators in Sri Lanka.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. NEWSLETTER SECTION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-[2.25rem] sm:rounded-[2.75rem] p-6 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="max-w-lg text-center lg:text-left">
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">Get Fresh Vlogs & Stories in Your Inbox</h3>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1.5">Zero spam. Receive our finest weekly travel visual stories.</p>
          </div>
          <div className="w-full lg:w-auto">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-2 bg-emerald-950/50 p-2 rounded-2xl sm:rounded-full border border-emerald-600/50">
              <input
                type="email"
                required
                placeholder="Enter your email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl sm:rounded-full bg-transparent text-white placeholder-emerald-200/60 text-xs sm:text-sm outline-none font-medium"
              />
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-white text-emerald-950 font-black text-xs sm:text-sm rounded-xl sm:rounded-full transition cursor-pointer">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}