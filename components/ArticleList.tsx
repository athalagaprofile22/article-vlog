import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  created_at: string;
}

export const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, content, cover_image, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading articles...</div>;
  }

  if (articles.length === 0) {
    return <div className="text-center py-12 text-gray-500">No published articles found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
      {articles.map((item) => (
        <article
          key={item.id}
          className="flex flex-col overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 shadow-lg transition-transform hover:-translate-y-1 hover:border-gray-700"
        >
          {item.cover_image && (
            <img
              src={item.cover_image}
              alt={item.title}
              className="h-48 w-full object-cover"
            />
          )}
          <div className="flex flex-1 flex-col p-5">
            <p className="text-xs text-blue-400 mb-2">
              {new Date(item.created_at).toLocaleDateString()}
            </p>
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
              {item.content}
            </p>
            <a
              href={`/article/${item.slug}`}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Read More →
            </a>
          </div>
        </article>
      ))}
    </div>
  );
};