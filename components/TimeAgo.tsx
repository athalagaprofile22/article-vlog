// components/TimeAgo.tsx
'use client';

import React, { useState, useEffect } from 'react';

function getTimeAgo(dateString: string): string {
  if (!dateString) return 'Recent';
  
  const date = new Date(dateString).getTime();
  const now = new Date().getTime();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 30) {
    return 'Just now';
  }
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
  }
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  }
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  if (daysAgo < 7) {
    return `${daysAgo} days ago`;
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TimeAgo({ date }: { date: string }) {
  const [timeAgoText, setTimeAgoText] = useState<string>('');

  useEffect(() => {
    // Component එක Mount වූ සැණින් වේලාව සකස් කරයි
    setTimeAgoText(getTimeAgo(date));

    // සෑම තත්පර 30කට වරක් කාලය ස්වයංක්‍රීයව පරීක්ෂා කර අප්ඩේට් කරයි
    const interval = setInterval(() => {
      setTimeAgoText(getTimeAgo(date));
    }, 30000);

    return () => clearInterval(interval);
  }, [date]);

  // Server-side hydration error මඟහරවා ගැනීමට මුල් අවස්ථාවේ දත්තය පෙන්වයි
  return <span>{timeAgoText || getTimeAgo(date)}</span>;
}