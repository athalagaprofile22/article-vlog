// components/PostInteractions.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart,
  ThumbsDown,
  Share2,
  Check,
  MessageCircle,
  Facebook,
  Link2,
  Send,
  Linkedin,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PostInteractionsProps {
  postId: string;
  postTitle: string;
  initialLikes?: number;
  initialUnlikes?: number;
}

// Post ID එක මත පදනම්ව ස්ථාවර Random Base අගයක් (18 - 85 අතර) සාදන function එක
function getDeterministicBaseLikes(id: string): number {
  if (!id) return 24;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const min = 18;
  const max = 85;
  return min + Math.abs(hash) % (max - min + 1);
}

export default function PostInteractions({
  postId,
  postTitle,
  initialLikes = 0,
  initialUnlikes = 0,
}: PostInteractionsProps) {
  // Post ID එකෙන් හැදෙන ස්ථාවර base like count එක (Client UI එකට පමණි)
  const baseLikesOffset = useMemo(() => getDeterministicBaseLikes(postId), [postId]);

  // Real Database Likes
  const [realLikes, setRealLikes] = useState(initialLikes);
  const [unlikes, setUnlikes] = useState(initialUnlikes);
  const [userVote, setUserVote] = useState<'liked' | 'unliked' | null>(null);
  const [loading, setLoading] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  // Load vote state & sync counts from Supabase
  useEffect(() => {
    try {
      const storedVotes = JSON.parse(localStorage.getItem('athalaga_votes') || '{}');
      if (storedVotes[postId]) {
        setUserVote(storedVotes[postId]);
      }
    } catch (e) {
      console.error(e);
    }

    async function fetchCounts() {
      const { data } = await supabase
        .from('posts')
        .select('likes_count, unlikes_count')
        .eq('id', postId)
        .single();

      if (data) {
        if (typeof data.likes_count === 'number') setRealLikes(data.likes_count);
        if (typeof data.unlikes_count === 'number') setUnlikes(data.unlikes_count);
      }
    }

    if (postId) fetchCounts();
  }, [postId]);

  // Click outside to close share menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target as Node)
      ) {
        setShareOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveVoteToDatabase = async (
    nextLikes: number,
    nextUnlikes: number,
    nextVote: 'liked' | 'unliked' | null
  ) => {
    setRealLikes(nextLikes);
    setUnlikes(nextUnlikes);
    setUserVote(nextVote);

    try {
      const storedVotes = JSON.parse(localStorage.getItem('athalaga_votes') || '{}');
      if (nextVote) {
        storedVotes[postId] = nextVote;
      } else {
        delete storedVotes[postId];
      }
      localStorage.setItem('athalaga_votes', JSON.stringify(storedVotes));
    } catch (e) {
      console.error(e);
    }

    try {
      const { error } = await supabase.rpc('vote_post', {
        post_id: postId,
        new_likes: nextLikes,
        new_unlikes: nextUnlikes,
      });

      if (error) {
        await supabase
          .from('posts')
          .update({ likes_count: nextLikes, unlikes_count: nextUnlikes })
          .eq('id', postId);
      }
    } catch (err) {
      console.error('Error saving vote:', err);
    }
  };

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    let nextLikes = realLikes;
    let nextUnlikes = unlikes;
    let nextVote: 'liked' | 'unliked' | null = null;

    if (userVote === 'liked') {
      nextLikes = Math.max(0, realLikes - 1);
      nextVote = null;
    } else {
      nextLikes = realLikes + 1;
      if (userVote === 'unliked') {
        nextUnlikes = Math.max(0, unlikes - 1);
      }
      nextVote = 'liked';
    }

    await saveVoteToDatabase(nextLikes, nextUnlikes, nextVote);
    setLoading(false);
  };

  const handleUnlike = async () => {
    if (loading) return;
    setLoading(true);

    let nextLikes = realLikes;
    let nextUnlikes = unlikes;
    let nextVote: 'liked' | 'unliked' | null = null;

    if (userVote === 'unliked') {
      nextUnlikes = Math.max(0, unlikes - 1);
      nextVote = null;
    } else {
      nextUnlikes = unlikes + 1;
      if (userVote === 'liked') {
        nextLikes = Math.max(0, realLikes - 1);
      }
      nextVote = 'unliked';
    }

    await saveVoteToDatabase(nextLikes, nextUnlikes, nextVote);
    setLoading(false);
  };

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(`${postTitle} - Athalaga.lk`);

  // පාඨකයාට පෙනෙන මුළු Likes ගණන (Base Random Offset + Real Database Likes)
  const displayLikes = baseLikesOffset + realLikes;

  return (
    <div className="relative flex items-center justify-between flex-wrap gap-3 pt-6 pb-2 border-t border-slate-100">
      {/* 1. LIKE & UNLIKE PILL */}
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-xs">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            userVote === 'liked'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              userVote === 'liked' ? 'fill-white text-white' : 'text-slate-500'
            }`}
          />
          <span>{displayLikes}</span>
          <span className="hidden sm:inline">Like</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Unlike Button (Public අයට count එක නොපෙනේ) */}
        <button
          type="button"
          onClick={handleUnlike}
          disabled={loading}
          title="Unlike"
          className={`inline-flex items-center justify-center p-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            userVote === 'unliked'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ThumbsDown
            className={`w-4 h-4 ${
              userVote === 'unliked' ? 'fill-white text-white' : 'text-slate-500'
            }`}
          />
        </button>
      </div>

      {/* 2. SHARE BUTTON */}
      <div className="relative" ref={shareDropdownRef}>
        <button
          type="button"
          onClick={() => setShareOpen(!shareOpen)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer active:scale-95"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Share</span>
        </button>

        {shareOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Share via
              </span>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Facebook className="w-3.5 h-3.5" />
              </div>
              <span>Facebook</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span>Telegram</span>
            </a>

            {/* X (Twitter) */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                𝕏
              </div>
              <span>X (Twitter)</span>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <Linkedin className="w-3.5 h-3.5" />
              </div>
              <span>LinkedIn</span>
            </a>

            <div className="border-t border-slate-100 my-1" />

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
              </span>
              {copied && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}