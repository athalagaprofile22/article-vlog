// app/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Trash2,
  Edit3,
  ExternalLink,
  PlusCircle,
  Save,
  Eye,
  EyeOff,
  Layers,
  RefreshCw,
  LogOut,
  Calendar,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  User,
  BarChart3,
  TrendingUp,
  Globe,
  ThumbsUp,
  Filter
} from 'lucide-react';

function getVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
}

function getLocalDateTimeString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function CreatePostPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'manage' | 'form' | 'messages'>('analytics');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<'article' | 'vlog'>('article');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Schedule Options State
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string>(getLocalDateTimeString());

  // Upload & Action State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Post Manager List
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Contact Messages State
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);

  // Check Auth
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAllPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPostsList(data);
    }
    setLoadingPosts(false);
  };

  const fetchContactMessages = async () => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessagesList(data);
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (session) {
      fetchAllPosts();
      fetchContactMessages();
    }
  }, [session]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPostId) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
    } else {
      setSession(data.session);
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);
      setFormMessage(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      if (data?.publicUrl) {
        setThumbnailUrl(data.publicUrl);
        setFormMessage({ type: 'success', text: 'Image uploaded successfully!' });
      }
    } catch (err: any) {
      setFormMessage({ type: 'error', text: 'Upload failed: ' + err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setType('article');
    setExcerpt('');
    setContent('');
    setThumbnailUrl('');
    setVideoUrl('');
    setTagsInput('');
    setIsScheduleEnabled(false);
    setPublishedAt(getLocalDateTimeString());
    setFormMessage(null);
  };

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id);
    setTitle(post.title || '');
    setSlug(post.slug || '');
    setType(post.type || 'article');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setThumbnailUrl(post.thumbnail_url || '');
    setVideoUrl(post.video_url || '');
    setTagsInput(Array.isArray(post.tags) ? post.tags.join(', ') : '');

    if (post.published_at) {
      const pubDate = new Date(post.published_at);
      setPublishedAt(getLocalDateTimeString(pubDate));
      setIsScheduleEnabled(pubDate.getTime() > Date.now());
    } else {
      setPublishedAt(getLocalDateTimeString());
      setIsScheduleEnabled(false);
    }

    setFormMessage(null);
    setActiveTab('form');
  };

  const handleTogglePublish = async (post: any) => {
    setTogglingId(post.id);
    const updatedStatus = !post.is_published;

    const { error } = await supabase
      .from('posts')
      .update({ is_published: updatedStatus })
      .eq('id', post.id);

    if (!error) {
      setPostsList((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_published: updatedStatus } : p))
      );
    } else {
      alert('Status යාවත්කාලීන කිරීමට නොහැකි විය: ' + error.message);
    }
    setTogglingId(null);
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('මෙම Post එක සම්පූර්ණයෙන්ම ඉවත් කිරීමට ඔබට අවශ්‍යද?')) return;
    setDeletingId(id);

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPostsList((prev) => prev.filter((p) => p.id !== id));
      if (editingPostId === id) resetForm();
    } else {
      alert('Delete කිරීමට නොහැකි විය: ' + error.message);
    }
    setDeletingId(null);
  };

  const handleToggleMessageRead = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    setMessagesList((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, is_read: nextStatus } : msg))
    );

    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: nextStatus })
      .eq('id', id);

    if (error) {
      setMessagesList((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, is_read: currentStatus } : msg))
      );
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('මෙම පණිවිඩය මකා දැමීමට ඔබට අවශ්‍යද?')) return;
    setDeletingMsgId(id);

    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) {
      setMessagesList((prev) => prev.filter((msg) => msg.id !== id));
    } else {
      alert('පණිවිඩය මකා දැමීමට නොහැකි විය: ' + error.message);
    }
    setDeletingMsgId(null);
  };

  const handleSavePost = async (actionType: 'draft' | 'direct_publish' | 'schedule') => {
    if (!title || !slug) {
      setFormMessage({ type: 'error', text: 'Title සහ Slug අනිවාර්ය වේ.' });
      return;
    }

    setSubmitting(true);
    setFormMessage(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let isPublished = false;
    let targetPublishedDate = new Date().toISOString();

    if (actionType === 'draft') {
      isPublished = false;
      targetPublishedDate = new Date().toISOString();
    } else if (actionType === 'direct_publish') {
      isPublished = true;
      targetPublishedDate = new Date().toISOString();
    } else if (actionType === 'schedule') {
      isPublished = true;
      targetPublishedDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
    }

    const postPayload = {
      title,
      slug,
      type,
      excerpt,
      content,
      thumbnail_url: thumbnailUrl || null,
      video_url: type === 'vlog' ? getVideoEmbedUrl(videoUrl) : null,
      tags: tagsArray,
      is_published: isPublished,
      published_at: targetPublishedDate,
    };

    if (editingPostId) {
      const { error } = await supabase
        .from('posts')
        .update(postPayload)
        .eq('id', editingPostId);

      if (error) {
        setFormMessage({ type: 'error', text: error.message });
      } else {
        resetForm();
        await fetchAllPosts();
        setActiveTab('manage');
      }
    } else {
      const { error } = await supabase.from('posts').insert([postPayload]);

      if (error) {
        setFormMessage({ type: 'error', text: error.message });
      } else {
        resetForm();
        await fetchAllPosts();
        setActiveTab('manage');
      }
    }
    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-center text-slate-900">Admin Login</h1>
          <p className="text-xs text-slate-500 text-center mt-1 mb-6">
            Athalaga.lk Admin Panel එකට ඇතුළු වීමට විස්තර ලබා දෙන්න.
          </p>

          {loginError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example12@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login වන්න'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isPostScheduled = (post: any) => {
    if (!post.published_at || !post.is_published) return false;
    return new Date(post.published_at).getTime() > Date.now();
  };

  const unreadMessagesCount = messagesList.filter((m) => !m.is_read).length;

  // Filter Posts based on Time Filter
  const filteredPostsList = postsList.filter((post) => {
    if (timeFilter === 'all') return true;
    const postDate = new Date(post.published_at || post.created_at);
    const now = new Date();

    if (timeFilter === 'today') {
      return postDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return postDate >= oneWeekAgo;
    } else if (timeFilter === 'month') {
      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
    } else if (timeFilter === 'year') {
      return postDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Analytics Metrics Calculation
  const totalPostsCount = postsList.length;
  const publishedPostsCount = postsList.filter((p) => p.is_published && !isPostScheduled(p)).length;
  const totalViewsCount = filteredPostsList.reduce((acc, curr) => acc + (Number(curr.views) || Number(curr.view_count) || 0), 0);
  const totalLikesCount = filteredPostsList.reduce((acc, curr) => acc + (Number(curr.likes_count) || 0), 0);
  const totalMessagesCount = messagesList.length;

  // Top Viewed Posts
  const topViewedPosts = [...filteredPostsList]
    .sort((a, b) => (Number(b.views) || Number(b.view_count) || 0) - (Number(a.views) || Number(a.view_count) || 0));

  // --- ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 pb-28 sm:pb-20">
      {/* Top Navbar - Desktop Only (Hidden on Mobile) */}
      <div className="hidden sm:block bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'analytics' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Analytics</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('manage'); resetForm(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'manage' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Posts</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'form' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{editingPostId ? 'Edit' : 'Add'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('messages'); fetchContactMessages(); }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'messages' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Messages</span>
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition shrink-0 cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="sm:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Admin Hub
        </span>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 mt-4 sm:mt-8">
        
        {/* SLIDE 0: PROFESSIONAL ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-10">
                <BarChart3 className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold mb-2.5 sm:mb-3">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Live Performance & Engagement
                </span>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight">Professional Analytics</h1>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-md font-medium">
                  Track individual article views, total likes, and traffic across custom time periods.
                </p>
              </div>

              {/* Time Range Filter Bar (Mobile: Smooth Horizontal Swipe with NO Gray Line) */}
              <div className="relative z-10 flex items-center gap-1.5 bg-black/25 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                {(['all', 'today', 'week', 'month', 'year'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition cursor-pointer shrink-0 ${
                      timeFilter === filter
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-emerald-100 hover:bg-white/10'
                    }`}
                  >
                    {filter === 'all' ? 'All Time' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* Total Views Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                    Views
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {totalViewsCount.toLocaleString()}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">({timeFilter} range)</p>
                </div>
              </div>

              {/* Total Likes Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                    Likes
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {totalLikesCount.toLocaleString()}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Total reader likes</p>
                </div>
              </div>

              {/* Total Messages Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                    Inquiries
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {totalMessagesCount}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">
                    {unreadMessagesCount > 0 ? `${unreadMessagesCount} unread` : 'All caught up'}
                  </p>
                </div>
              </div>

              {/* Platform Status Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                    Status
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online Live
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Netlify / Supabase</p>
                </div>
              </div>

            </div>

            {/* PER-ARTICLE PERFORMANCE BREAKDOWN (Mobile: Modern Stack Cards | Desktop: Clean Table) */}
            <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Per-Article Performance Breakdown</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    එක් එක් ලිපිය වෙන වෙනම ලැබී ඇති Views සහ Likes ගණන
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Filter: <strong className="uppercase text-emerald-700">{timeFilter}</strong></span>
                </div>
              </div>

              {topViewedPosts.length > 0 ? (
                <>
                  {/* MOBILE VIEW: Gorgeous Card Stack (No horizontal scrolling or weird tables on phones) */}
                  <div className="block sm:hidden space-y-3">
                    {topViewedPosts.map((post) => {
                      const postViews = Number(post.views) || Number(post.view_count) || 0;
                      const postLikes = Number(post.likes_count) || 0;
                      return (
                        <div
                          key={post.id}
                          className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase mb-1 ${
                                post.type === 'vlog' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {post.type}
                              </span>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                                {post.title}
                              </h4>
                            </div>
                            <Link
                              href={`/posts/${post.slug}`}
                              target="_blank"
                              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-700 shrink-0"
                              title="View Post"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 text-xs font-bold">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                {postViews} Views
                              </span>
                              <span className="inline-flex items-center gap-1 text-teal-800 bg-teal-100/70 px-3 py-1 rounded-full">
                                <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                                {postLikes} Likes
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP VIEW: Full Professional Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 font-bold">Article / Vlog Title</th>
                          <th className="pb-3 font-bold">Type</th>
                          <th className="pb-3 font-bold text-center">Views</th>
                          <th className="pb-3 font-bold text-center">Likes</th>
                          <th className="pb-3 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topViewedPosts.map((post) => {
                          const postViews = Number(post.views) || Number(post.view_count) || 0;
                          const postLikes = Number(post.likes_count) || 0;
                          return (
                            <tr key={post.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 pr-4 max-w-md">
                                <div className="font-bold text-slate-900 truncate">{post.title}</div>
                                <div className="text-[11px] text-slate-400 font-mono truncate">/{post.slug}</div>
                              </td>
                              <td className="py-3.5 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  post.type === 'vlog' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {post.type}
                                </span>
                              </td>
                              <td className="py-3.5 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                                  <Eye className="w-3 h-3 text-emerald-600" />
                                  {postViews}
                                </span>
                              </td>
                              <td className="py-3.5 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                                  <ThumbsUp className="w-3 h-3 text-teal-600" />
                                  {postLikes}
                                </span>
                              </td>
                              <td className="py-3.5 text-right whitespace-nowrap">
                                <Link
                                  href={`/posts/${post.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold transition"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  මෙම කාල සීමාව තුළ ලිපි කිසිවක් හමු නොවීය.
                </div>
              )}
            </div>

          </div>
        )}

        {/* SLIDE 1: MANAGE POSTS */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900">Manage Posts</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  දැනට Database එකේ ඇති සියලුම ලිපි හා වීඩියෝ ({postsList.length})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAllPosts}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setActiveTab('form'); }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add New Post</span>
                </button>
              </div>
            </div>

            {loadingPosts ? (
              <div className="text-center py-16">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-emerald-700" />
              </div>
            ) : postsList.length > 0 ? (
              <>
                <div className="block md:hidden space-y-3">
                  {postsList.map((post) => {
                    const scheduled = isPostScheduled(post);
                    return (
                      <div
                        key={post.id}
                        className="border border-slate-200/90 rounded-2xl p-3.5 bg-slate-50/50 hover:bg-white transition shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                              /{post.slug}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                              post.type === 'vlog' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {post.type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={togglingId === post.id}
                            onClick={() => handleTogglePublish(post)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer active:scale-95 ${
                              !post.is_published
                                ? 'bg-slate-200/60 text-slate-600 border-slate-300'
                                : scheduled
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {togglingId === post.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : !post.is_published ? (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-400" />
                                <span>Draft</span>
                              </>
                            ) : scheduled ? (
                              <>
                                <Clock className="w-3 h-3 text-sky-600" />
                                <span>Scheduled</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Published</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(post)}
                              className="p-1.5 bg-white border border-slate-200 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/posts/${post.slug}`}
                              target="_blank"
                              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                              title="View"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === post.id}
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Post</th>
                        <th className="pb-3 font-bold">Type</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold">Publish Time</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {postsList.map((post) => {
                        const scheduled = isPostScheduled(post);
                        return (
                          <tr key={post.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 pr-4 max-w-sm">
                              <div className="font-bold text-slate-900 truncate">{post.title}</div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">{post.slug}</div>
                            </td>
                            <td className="py-3.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                post.type === 'vlog' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {post.type}
                              </span>
                            </td>
                            <td className="py-3.5 whitespace-nowrap">
                              <button
                                type="button"
                                disabled={togglingId === post.id}
                                onClick={() => handleTogglePublish(post)}
                                title="Click to toggle status"
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
                                  !post.is_published
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : scheduled
                                    ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {togglingId === post.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : !post.is_published ? (
                                  <>
                                    <EyeOff className="w-3 h-3 text-slate-400" />
                                    <span>Draft</span>
                                  </>
                                ) : scheduled ? (
                                  <>
                                    <Clock className="w-3 h-3 text-sky-600" />
                                    <span>Scheduled</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>Published</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 whitespace-nowrap text-slate-500">
                              <span className="flex items-center gap-1 text-[11px]">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {post.published_at
                                  ? new Date(post.published_at).toLocaleString()
                                  : new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3.5 text-right whitespace-nowrap space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditClick(post)}
                                className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded-lg transition cursor-pointer"
                                title="Edit post"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/posts/${post.slug}`}
                                target="_blank"
                                className="inline-block p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition"
                                title="Open link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                type="button"
                                disabled={deletingId === post.id}
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition cursor-pointer disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === post.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                තවමත් කිසිදු Post එකක් ඇතුළත් කර නොමැත.
              </div>
            )}
          </div>
        )}

        {/* SLIDE 2: FORM SLIDE */}
        {activeTab === 'form' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  {editingPostId ? (
                    <>
                      <Edit3 className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600" />
                      <span>Edit Post</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
                      <span>Create New Post</span>
                    </>
                  )}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {editingPostId
                    ? 'දැනට පවතින ලිපිය යාවත්කාලීන කරන්න.'
                    : 'නව ලිපියක් (Article) හෝ වීඩියෝවක් (Vlog) පළ කරන්න.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { resetForm(); setActiveTab('manage'); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Back to List
              </button>
            </div>

            {formMessage && (
              <div
                className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-medium mb-6 ${
                  formMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {formMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formMessage.text}</span>
              </div>
            )}

            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Post Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('article')}
                    className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      type === 'article'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Article
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('vlog')}
                    className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      type === 'vlog'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4" /> Video Vlog
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="මාතෘකාව ඇතුළත් කරන්න..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-slug-url"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Cover Image / Thumbnail (Direct File Upload)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  {thumbnailUrl ? (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                      <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {uploadingImage ? 'Supabase Storage එකට upload වෙමින් පවතී...' : 'Device එකෙන් JPG/PNG පින්තූරයක් තෝරන්න.'}
                    </p>
                  </div>
                </div>
              </div>

              {type === 'vlog' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Video URL (Google Drive Share Link හෝ YouTube Link)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Short Excerpt (කෙටි හැඳින්වීම)</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="ලිපිය ගැන කෙටි හැඳින්වීමක්..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Full Content (සම්පූර්ණ විස්තරය)</label>
                <textarea
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="සම්පූර්ණ ලිපිය මෙතැන type කරන්න..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Tags (කොමා වලින් වෙන් කරන්න)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="travel, tech, news"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Schedule for Later (පසු වේලාවකට Schedule කරන්න)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        නියමිත දිනයකදී හා වේලාවකදී ස්වයංක්‍රීයව Auto-publish කිරීමට අවශ්‍ය නම් පමණක් මෙය සක්‍රිය කරන්න.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isScheduleEnabled}
                      onChange={(e) => setIsScheduleEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                {isScheduleEnabled && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Select Date & Time (දිනය සහ වේලාව තෝරන්න):
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 bg-white font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting || uploadingImage}
                  onClick={() => handleSavePost('draft')}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Draft</span>
                </button>

                <button
                  type="button"
                  disabled={submitting || uploadingImage}
                  onClick={() => handleSavePost('direct_publish')}
                  className="w-full sm:flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{editingPostId ? 'Update & Publish Now' : 'Publish Now (ක්ෂණිකව)'}</span>
                </button>

                {isScheduleEnabled && (
                  <button
                    type="button"
                    disabled={submitting || uploadingImage}
                    onClick={() => handleSavePost('schedule')}
                    className="w-full sm:flex-1 py-3 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-700/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>Schedule Post</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { resetForm(); setActiveTab('manage'); }}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900">Contact Messages</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  පරිශීලකයින් එවනු ලබන සියලුම පණිවිඩ ({messagesList.length})
                </p>
              </div>
              <button
                type="button"
                onClick={fetchContactMessages}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingMessages ? (
              <div className="text-center py-16">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-emerald-700" />
              </div>
            ) : messagesList.length > 0 ? (
              <div className="space-y-4">
                {messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition shadow-2xs overflow-hidden ${
                      msg.is_read ? 'bg-slate-50/50 border-slate-200 opacity-80' : 'bg-white border-emerald-300 ring-2 ring-emerald-500/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          msg.is_read ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700 font-bold'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{msg.name}</h4>
                          <a href={`mailto:${msg.email}`} className="text-[11px] text-emerald-700 font-semibold hover:underline block truncate">
                            {msg.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleMessageRead(msg.id, msg.is_read)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              msg.is_read
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{msg.is_read ? 'Read' : 'Mark Read'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={deletingMsgId === msg.id}
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer disabled:opacity-50"
                            title="Delete message"
                          >
                            {deletingMsgId === msg.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {msg.subject && (
                      <p className="text-xs font-bold text-slate-800 mb-2 bg-slate-100/70 px-3 py-1 rounded-xl inline-block">
                        Subject: {msg.subject}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 break-words whitespace-pre-wrap overflow-hidden">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>තවමත් කිසිදු පණිවිඩයක් ලැබී නොමැත.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MOBILE ONLY: Glassmorphism Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-50 transform-gpu">
        <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-3xl px-3 py-2 shadow-xl shadow-emerald-950/10 flex items-center justify-around">
          
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'analytics' ? 'text-emerald-700 bg-emerald-50/80 font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Stats</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('manage'); resetForm(); }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'manage' ? 'text-emerald-700 bg-emerald-50/80 font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Posts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'form' ? 'text-emerald-700 bg-emerald-50/80 font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <PlusCircle className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">{editingPostId ? 'Edit' : 'Add'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('messages'); fetchContactMessages(); }}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'messages' ? 'text-emerald-700 bg-emerald-50/80 font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Inbox</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute top-0 right-1 bg-rose-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition cursor-pointer font-semibold"
            title="Logout"
          >
            <LogOut className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Exit</span>
          </button>

        </div>
      </div>

    </div>
  );
}