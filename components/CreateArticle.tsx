import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreateArticleProps {
  onArticleAdded?: () => void;
}

export const CreateArticle: React.FC<CreateArticleProps> = ({ onArticleAdded }) => {
  const [title, setTitle] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    // Title එකෙන් URL-friendly slug එකක් හැදීම
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error } = await supabase.from('articles').insert([
      {
        title,
        slug,
        content,
        cover_image: coverImage || null,
        is_published: isPublished,
      },
    ]);

    setLoading(false);

    if (error) {
      setStatusMessage({ type: 'error', text: `Failed to save: ${error.message}` });
    } else {
      setStatusMessage({
        type: 'success',
        text: isPublished ? 'Article published successfully!' : 'Article saved as draft!',
      });
      setTitle('');
      setCoverImage('');
      setContent('');
      if (onArticleAdded) onArticleAdded();
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-2xl bg-gray-900 border border-gray-800 p-8 shadow-xl text-white">
      <h2 className="text-xl font-bold mb-6 text-gray-100">Write New Article</h2>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Article Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title..."
            className="w-full rounded-xl bg-gray-800/80 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL (Optional)</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-xl bg-gray-800/80 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Article Content</label>
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article markdown or plain text here..."
            className="w-full rounded-xl bg-gray-800/80 border border-gray-700 p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="publishToggle"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="publishToggle" className="text-sm text-gray-300 select-none cursor-pointer">
            Publish immediately (visible to public)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Saving...' : isPublished ? 'Publish Article' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};